using System.Collections.Immutable;
using System.IO.Compression;
using System.Reflection;
using System.Reflection.Metadata;
using System.Reflection.PortableExecutable;
using System.Text.Json;

if (args.Length is < 1 or > 2 || !File.Exists(args[0]))
{
    Console.Error.WriteLine("Usage: Win32MetadataReader <Windows.Win32.winmd> [output.json]");
    return 2;
}

using var stream = OpenMetadata(args[0]);
using var pe = new PEReader(stream);
var reader = pe.GetMetadataReader();
var typeProvider = new TypeNameProvider(reader);
var attributeProvider = new AttributeValueProvider(reader);
var functions = new List<FunctionRecord>();

foreach (var typeHandle in reader.TypeDefinitions)
{
    var type = reader.GetTypeDefinition(typeHandle);
    var typeNamespace = reader.GetString(type.Namespace);
    if (!typeNamespace.StartsWith("Windows.Win32", StringComparison.Ordinal)) continue;

    foreach (var methodHandle in type.GetMethods())
    {
        var method = reader.GetMethodDefinition(methodHandle);
        if ((method.Attributes & MethodAttributes.PinvokeImpl) == 0) continue;
        if ((method.Attributes & MethodAttributes.Public) == 0) continue;

        var import = method.GetImport();
        var module = reader.GetModuleReference(import.Module);
        var signature = method.DecodeSignature(typeProvider, genericContext: null);
        var parameterDefinitions = method.GetParameters()
            .Select(handle => reader.GetParameter(handle))
            .Where(parameter => parameter.SequenceNumber > 0)
            .ToDictionary(parameter => parameter.SequenceNumber);
        var parameters = new List<ParameterRecord>();
        for (var index = 0; index < signature.ParameterTypes.Length; index++)
        {
            parameterDefinitions.TryGetValue(index + 1, out var parameter);
            var attributes = parameter.Attributes;
            parameters.Add(new ParameterRecord(
                parameter.Name.IsNil ? $"arg{index + 1}" : reader.GetString(parameter.Name),
                signature.ParameterTypes[index],
                (attributes & ParameterAttributes.Optional) != 0,
                Direction(attributes)
            ));
        }

        string? documentation = null;
        string? header = null;
        var metadataAttributes = new Dictionary<string, string[]>();
        foreach (var attributeHandle in method.GetCustomAttributes())
        {
            var attribute = reader.GetCustomAttribute(attributeHandle);
            var attributeName = AttributeTypeName(reader, attribute.Constructor);
            try
            {
                var decoded = attribute.DecodeValue(attributeProvider);
                var values = decoded.FixedArguments.Select(argument => SerializedValue(argument.Value)).ToArray();
                if (values.Length > 0) metadataAttributes[attributeName] = values;
                if (attributeName.EndsWith(".DocumentationAttribute", StringComparison.Ordinal) && values.Length > 0)
                    documentation = values.FirstOrDefault(value => value.StartsWith("http", StringComparison.OrdinalIgnoreCase));
                if (attributeName.EndsWith(".NativeTypeInfoAttribute", StringComparison.Ordinal) && values.Length > 0)
                    header = values.FirstOrDefault(value => value.EndsWith(".h", StringComparison.OrdinalIgnoreCase));
            }
            catch (BadImageFormatException)
            {
                // An undecodable nonessential attribute must not hide a callable.
            }
        }

        var managedName = reader.GetString(method.Name);
        var entryPoint = import.Name.IsNil ? managedName : reader.GetString(import.Name);
        functions.Add(new FunctionRecord(
            typeNamespace,
            managedName,
            entryPoint,
            reader.GetString(module.Name),
            signature.ReturnType,
            parameters,
            import.Attributes.ToString(),
            documentation,
            header,
            metadataAttributes
        ));
    }
}

functions.Sort((left, right) =>
{
    var order = string.CompareOrdinal(left.Namespace, right.Namespace);
    if (order != 0) return order;
    order = string.CompareOrdinal(left.Name, right.Name);
    if (order != 0) return order;
    order = string.CompareOrdinal(left.Dll, right.Dll);
    if (order != 0) return order;
    return string.CompareOrdinal(left.EntryPoint, right.EntryPoint);
});

var output = JsonSerializer.Serialize(new
{
    metadataVersion = reader.MetadataVersion,
    functions,
}, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
if (args.Length == 2) File.WriteAllText(args[1], output);
else Console.Write(output);
return 0;

static Stream OpenMetadata(string path)
{
    if (Path.GetExtension(path).Equals(".winmd", StringComparison.OrdinalIgnoreCase))
        return File.OpenRead(path);
    if (!Path.GetExtension(path).Equals(".nupkg", StringComparison.OrdinalIgnoreCase))
        throw new InvalidOperationException("The metadata input must be a .winmd or .nupkg file.");
    using var archive = ZipFile.OpenRead(path);
    var entry = archive.GetEntry("Windows.Win32.winmd")
        ?? throw new InvalidDataException("The NuGet package does not contain Windows.Win32.winmd.");
    var memory = new MemoryStream((int)entry.Length);
    using var input = entry.Open();
    input.CopyTo(memory);
    memory.Position = 0;
    return memory;
}

static string Direction(ParameterAttributes attributes)
{
    var input = (attributes & ParameterAttributes.In) != 0;
    var output = (attributes & ParameterAttributes.Out) != 0;
    return input && output ? "inout" : output ? "out" : "in";
}

static string SerializedValue(object? value) => value switch
{
    null => "",
    ImmutableArray<CustomAttributeTypedArgument<string>> values =>
        string.Join(",", values.Select(item => SerializedValue(item.Value))),
    _ => Convert.ToString(value, System.Globalization.CultureInfo.InvariantCulture) ?? "",
};

static string AttributeTypeName(MetadataReader reader, EntityHandle constructor)
{
    EntityHandle typeHandle = constructor.Kind switch
    {
        HandleKind.MemberReference => reader.GetMemberReference((MemberReferenceHandle)constructor).Parent,
        HandleKind.MethodDefinition => reader.GetMethodDefinition((MethodDefinitionHandle)constructor).GetDeclaringType(),
        _ => default,
    };
    return TypeFullName(reader, typeHandle);
}

static string TypeFullName(MetadataReader reader, EntityHandle handle) => handle.Kind switch
{
    HandleKind.TypeDefinition => Join(
        reader.GetString(reader.GetTypeDefinition((TypeDefinitionHandle)handle).Namespace),
        reader.GetString(reader.GetTypeDefinition((TypeDefinitionHandle)handle).Name)),
    HandleKind.TypeReference => Join(
        reader.GetString(reader.GetTypeReference((TypeReferenceHandle)handle).Namespace),
        reader.GetString(reader.GetTypeReference((TypeReferenceHandle)handle).Name)),
    _ => handle.Kind.ToString(),
};

static string Join(string typeNamespace, string name) =>
    string.IsNullOrEmpty(typeNamespace) ? name : $"{typeNamespace}.{name}";

sealed record ParameterRecord(string Name, string Type, bool Optional, string Direction);
sealed record FunctionRecord(
    string Namespace,
    string Name,
    string EntryPoint,
    string Dll,
    string Returns,
    List<ParameterRecord> Parameters,
    string ImportAttributes,
    string? Documentation,
    string? Header,
    Dictionary<string, string[]> MetadataAttributes
);

sealed class AttributeValueProvider(MetadataReader reader) : ICustomAttributeTypeProvider<string>
{
    public string GetPrimitiveType(PrimitiveTypeCode typeCode) => typeCode.ToString();
    public string GetSystemType() => "System.Type";
    public bool IsSystemType(string type) => type == "System.Type";
    public string GetTypeFromSerializedName(string name) => name;
    public PrimitiveTypeCode GetUnderlyingEnumType(string type) => PrimitiveTypeCode.Int32;
    public string GetSZArrayType(string elementType) => $"{elementType}[]";
    public string GetTypeFromDefinition(MetadataReader _, TypeDefinitionHandle handle, byte rawTypeKind) =>
        MetadataNames.TypeFullName(reader, handle);
    public string GetTypeFromReference(MetadataReader _, TypeReferenceHandle handle, byte rawTypeKind) =>
        MetadataNames.TypeFullName(reader, handle);
}

sealed class TypeNameProvider(MetadataReader reader) : ISignatureTypeProvider<string, object?>
{
    public string GetPrimitiveType(PrimitiveTypeCode typeCode) => typeCode switch
    {
        PrimitiveTypeCode.Void => "void",
        PrimitiveTypeCode.Boolean => "BOOL",
        PrimitiveTypeCode.Char => "WCHAR",
        PrimitiveTypeCode.SByte => "INT8",
        PrimitiveTypeCode.Byte => "UINT8",
        PrimitiveTypeCode.Int16 => "INT16",
        PrimitiveTypeCode.UInt16 => "UINT16",
        PrimitiveTypeCode.Int32 => "INT32",
        PrimitiveTypeCode.UInt32 => "UINT32",
        PrimitiveTypeCode.Int64 => "INT64",
        PrimitiveTypeCode.UInt64 => "UINT64",
        PrimitiveTypeCode.Single => "FLOAT",
        PrimitiveTypeCode.Double => "DOUBLE",
        PrimitiveTypeCode.String => "PWSTR",
        PrimitiveTypeCode.IntPtr => "INT_PTR",
        PrimitiveTypeCode.UIntPtr => "UINT_PTR",
        PrimitiveTypeCode.Object => "object",
        _ => typeCode.ToString(),
    };
    public string GetTypeFromDefinition(MetadataReader _, TypeDefinitionHandle handle, byte rawTypeKind) =>
        ShortTypeName(MetadataNames.TypeFullName(reader, handle));
    public string GetTypeFromReference(MetadataReader _, TypeReferenceHandle handle, byte rawTypeKind) =>
        ShortTypeName(MetadataNames.TypeFullName(reader, handle));
    public string GetTypeFromSpecification(MetadataReader _, object? context, TypeSpecificationHandle handle, byte rawTypeKind) =>
        reader.GetTypeSpecification(handle).DecodeSignature(this, context);
    public string GetSZArrayType(string elementType) => $"{elementType}[]";
    public string GetArrayType(string elementType, ArrayShape shape) => $"{elementType}[{new string(',', Math.Max(0, shape.Rank - 1))}]";
    public string GetPointerType(string elementType) => $"{elementType}*";
    public string GetByReferenceType(string elementType) => $"{elementType}&";
    public string GetPinnedType(string elementType) => elementType;
    public string GetModifiedType(string modifier, string unmodifiedType, bool isRequired) => unmodifiedType;
    public string GetGenericInstantiation(string genericType, ImmutableArray<string> typeArguments) =>
        $"{genericType}<{string.Join(", ", typeArguments)}>";
    public string GetGenericMethodParameter(object? context, int index) => $"!!{index}";
    public string GetGenericTypeParameter(object? context, int index) => $"!{index}";
    public string GetFunctionPointerType(MethodSignature<string> signature) =>
        $"delegate*<{string.Join(", ", signature.ParameterTypes.Append(signature.ReturnType))}>";
    public string GetUnsupportedSignatureTypeKind(byte rawTypeKind) => $"unknown(0x{rawTypeKind:X2})";

    private static string ShortTypeName(string value) => value.Split('.').Last();
}

static class MetadataNames
{
    public static string TypeFullName(MetadataReader reader, EntityHandle handle) => handle.Kind switch
    {
        HandleKind.TypeDefinition => Join(
            reader.GetString(reader.GetTypeDefinition((TypeDefinitionHandle)handle).Namespace),
            reader.GetString(reader.GetTypeDefinition((TypeDefinitionHandle)handle).Name)),
        HandleKind.TypeReference => Join(
            reader.GetString(reader.GetTypeReference((TypeReferenceHandle)handle).Namespace),
            reader.GetString(reader.GetTypeReference((TypeReferenceHandle)handle).Name)),
        _ => handle.Kind.ToString(),
    };

    private static string Join(string typeNamespace, string name) =>
        string.IsNullOrEmpty(typeNamespace) ? name : $"{typeNamespace}.{name}";
}

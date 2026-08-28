(() => {
  const catalog = window.ILOVEOS_PYWIN32_API_CATALOG;
  const reference = window.ILOVEOS_REFERENCE;
  const signatures = window.ILOVEOS_API_SIGNATURES;
  if (!catalog || !reference?.pywin32Modules || !signatures) return;

  const groupedModules = {
    win32net: "win32net / win32wnet",
    win32wnet: "win32net / win32wnet",
  };
  const represented = [];

  for (const sourceModule of catalog.modules) {
    const targetName = groupedModules[sourceModule.name] || sourceModule.name;
    let target = reference.pywin32Modules.find((module) => module.name === targetName);
    if (!target) {
      target = {
        name: targetName,
        category: sourceModule.category,
        label: `Complete published ${sourceModule.name} method reference`,
        description: sourceModule.summary,
        useWhen: `You need a callable documented by the pywin32 project in the ${sourceModule.name} module.`,
        course: "Extended pywin32 reference",
        features: [],
      };
      reference.pywin32Modules.push(target);
    }

    const existingNames = new Set(target.features.map((feature) => feature.name));
    for (const method of sourceModule.methods) {
      const featureName = groupedModules[sourceModule.name] ? `${sourceModule.name}.${method.name}` : method.name;
      if (!existingNames.has(featureName)) {
        target.features.push({
          name: featureName,
          task: method.summary,
          detail: `This callable is included from the complete published ${sourceModule.name} method inventory. Open it for the documented parameters, return value, and source page.`,
          catalogModule: sourceModule.name,
          catalogSource: method.source,
        });
        existingNames.add(featureName);
      }

      const signatureKey = `${target.name}::${featureName}`;
      if (!signatures[signatureKey]) {
        signatures[signatureKey] = {
          kind: "function",
          signatures: [method.signature],
          sources: [method.source],
        };
      }
      represented.push(`${sourceModule.name}::${method.name}`);
    }
  }

  window.ILOVEOS_PYWIN32_CATALOG_STATS = {
    source: catalog.source,
    inventorySha256: catalog.inventorySha256,
    publishedModules: catalog.moduleCount,
    publishedMethods: catalog.documentedMethodCount,
    runtimeVersion: catalog.runtimeVersion,
    runtimeMethods: catalog.runtimeMethodCount,
    unionMethods: catalog.methodCount,
    runtimeOnlyMethods: catalog.runtimeOnlyMethods.length,
    representedMethods: new Set(represented).size,
    unavailableMethodPages: catalog.unavailableMethodPages,
  };
})();

import importlib
import importlib.metadata
import inspect
import json


MODULES = [
    "_winxptheme", "mmapfile", "odbc", "perfmon", "pywintypes", "servicemanager", "timer", "win2kras",
    "win32api", "win32clipboard", "win32console", "win32cred", "win32crypt", "win32event", "win32evtlog",
    "win32file", "win32gui", "win32help", "win32inet", "win32job", "win32lz", "win32net", "win32pdh",
    "win32pipe", "win32print", "win32process", "win32profile", "win32ras", "win32security", "win32service",
    "win32transaction", "win32ts", "win32wnet", "wincerapi",
]


inventory = {}
unavailable = {}
for module_name in MODULES:
    try:
        module = importlib.import_module(module_name)
    except Exception as error:
        unavailable[module_name] = f"{type(error).__name__}: {error}"
        continue

    methods = []
    for name in dir(module):
        if name.startswith("_"):
            continue
        try:
            value = getattr(module, name)
        except Exception:
            continue
        if inspect.isroutine(value):
            methods.append(name)
    inventory[module_name] = sorted(set(methods))

print(json.dumps({
    "version": importlib.metadata.version("pywin32"),
    "modules": inventory,
    "unavailable": unavailable,
}, sort_keys=True))

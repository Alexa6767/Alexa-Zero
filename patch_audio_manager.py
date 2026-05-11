from pathlib import Path
p = Path(r'e:\Alexa-Zero\audio-manager.js')
t = p.read_text(encoding='utf-8')
old = 'if (document.readyState === "loading") {\n    document.addEventListener("DOMContentLoaded", () => AudioManager.initialize());\n} else {\n    AudioManager.initialize();\n}'
new = 'if (typeof window != \'undefined\') {\n    window.AudioManager = AudioManager;\n}\n\nif (document.readyState === "loading") {\n    document.addEventListener("DOMContentLoaded", () => AudioManager.initialize());\n} else {\n    AudioManager.initialize();\n}'
if old not in t:
    raise SystemExit('old block not found')
p.write_text(t.replace(old, new), encoding='utf-8')
print('patched')

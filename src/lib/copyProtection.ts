const MIN_LENGTH = 200;
const SKIP_PATHS = ["/admin", "/cabinet", "/school/learning"];

/** При копировании большого фрагмента текста добавляет ссылку на источник.
 *  Короткие фрагменты и поля ввода не трогаем — ученикам копировать удобно. */
export function setupCopyAttribution() {
  document.addEventListener("copy", (e: ClipboardEvent) => {
    try {
      if (SKIP_PATHS.some((p) => location.pathname.startsWith(p))) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true'], pre, code")) return;
      const sel = window.getSelection();
      const text = sel ? sel.toString() : "";
      if (text.trim().length < MIN_LENGTH || !e.clipboardData) return;
      const url = `https://учисьпро.рф${location.pathname}`;
      const note = `\n\nИсточник: ${url}\n© УЧИСЬПРО. Перепечатка — только с активной ссылкой на источник.`;
      e.clipboardData.setData("text/plain", text + note);
      const box = document.createElement("div");
      if (sel && sel.rangeCount) box.appendChild(sel.getRangeAt(0).cloneContents());
      e.clipboardData.setData(
        "text/html",
        `${box.innerHTML}<br><br>Источник: <a href="${url}">${url}</a><br>© УЧИСЬПРО. Перепечатка — только с активной ссылкой на источник.`,
      );
      e.preventDefault();
    } catch {
      /* копирование всегда должно работать */
    }
  });
}

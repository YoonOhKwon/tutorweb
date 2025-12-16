// ==============================
// 기본 요소
// ==============================
const editor = document.getElementById("prompt");
const API_BASE = "https://tutor-production-679f.up.railway.app";

// ==============================
// 스크롤 설정
// ==============================
const SCROLL_MULTIPLIER = 0.4;   // 마우스 휠 감도
const SCROLL_STEP = 12;          // Alt + ↑↓ 미세 스크롤
let scrollTimer = null;

// ==============================
// 마우스 휠 스크롤 (조건부)
// ==============================
editor.addEventListener(
  "wheel",
  (e) => {
    const maxScroll = editor.scrollHeight - editor.clientHeight;
    if (maxScroll <= 0) return;   // 스크롤 불가능하면 개입 X

    e.preventDefault();
    editor.scrollTop += e.deltaY * SCROLL_MULTIPLIER;
  },
  { passive: false }
);

// ==============================
// 키보드 단축키 (editor에 직접)
// ==============================
editor.addEventListener("keydown", (e) => {
  // Alt + D → 프롬프트 전체 삭제
  if (e.altKey && e.key.toLowerCase() === "d") {
    e.preventDefault();
    editor.innerText = "";
    editor.focus();
    return;
  }

  // Alt + ↑ / ↓ → 미세 스크롤 (연속)
  if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
    e.preventDefault();
    if (scrollTimer) return;

    scrollTimer = setInterval(() => {
      editor.scrollTop +=
        e.key === "ArrowDown" ? SCROLL_STEP : -SCROLL_STEP;
    }, 30);
  }

  // Enter: 실행 / Shift+Enter: 줄바꿈
  if (!e.isComposing && e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    askAI();
  }
});

editor.addEventListener("keyup", () => {
  if (scrollTimer) {
    clearInterval(scrollTimer);
    scrollTimer = null;
  }
});

// ==============================
// 커서 제어
// ==============================
function placeCaretAtEnd(el) {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

window.addEventListener("load", () => editor.focus());

// ==============================
// AI 요청
// ==============================
async function askAI() {
  const userPrompt = (editor.innerText || "").trim();
  if (!userPrompt) return;

  document.body.classList.add("loading");

  try {
    const res = await fetch(`${API_BASE}/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userPrompt, text: "" }),
    });

    const raw = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${raw}`);

    const data = JSON.parse(raw);
    editor.innerText = data?.result ?? "";
    placeCaretAtEnd(editor);

  } catch (err) {
    console.error("AI 요청 오류:", err);
    alert(String(err));
  } finally {
    document.body.classList.remove("loading");
  }
}

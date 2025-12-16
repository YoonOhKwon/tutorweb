// 전체 UI 제거: 페이지 전체를 '프롬프트 입력 영역'으로 사용
const editor = document.getElementById("prompt");
const API_BASE = "https://tutor-production-679f.up.railway.app";
const promptEl = document.getElementById("prompt");

document.addEventListener("keydown", (e) => {
  // Alt + D → 프롬프트 내용 삭제
  if (e.altKey && e.key.toLowerCase() === "d") {
    e.preventDefault();
    promptEl.innerText = "";
    promptEl.focus();
  }
});



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

// Enter: 실행, Shift+Enter: 줄바꿈
editor.addEventListener("keydown", (e) => {
  if (e.isComposing) return;
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    askAI();
  }
});

async function askAI() {
  const userPrompt = (editor.innerText || "").trim();
  if (!userPrompt) return;

  document.body.classList.add("loading");

  try {
    const res = await fetch(`${API_BASE}/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userPrompt, text: "" })
    });

    // ✅ 여기 핵심: JSON으로 바로 파싱하지 말고, 먼저 text로 받고 상태코드 체크
    const raw = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${raw}`);

    const data = JSON.parse(raw);
    editor.innerText = data?.result ?? "";
    placeCaretAtEnd(editor);
  } catch (err) {
    console.error("AI 요청 오류:", err);
    alert(String(err)); // ✅ 이제 진짜 원인이 뜸
  } finally {
    document.body.classList.remove("loading");
  }
}

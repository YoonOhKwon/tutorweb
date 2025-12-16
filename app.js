// 전체 UI 제거: 페이지 전체를 '프롬프트 입력 영역'으로 사용
const editor = document.getElementById("prompt");

function placeCaretAtEnd(el) {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

window.addEventListener("load", () => {
  // 새로고침/접속 시 커서 바로 들어오게
  editor.focus();
});

// Enter: 실행, Shift+Enter: 줄바꿈
editor.addEventListener("keydown", (e) => {
  if (e.isComposing) return; // 한글 조합 중 Enter 오작동 방지

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
    const res = await fetch("https://hufsmate-production.up.railway.app/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 기존 백엔드 스펙 유지: prompt만 사용하고 text는 비워둠
      body: JSON.stringify({ text: "", prompt: userPrompt })
    });

    const data = await res.json();
    editor.innerText = (data && data.result) ? data.result : "";
    placeCaretAtEnd(editor);
  } catch (err) {
    console.error("AI 요청 오류:", err);
    alert("AI 분석 중 오류 발생");
  } finally {
    document.body.classList.remove("loading");
  }
}

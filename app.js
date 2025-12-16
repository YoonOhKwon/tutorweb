const editor = document.getElementById("prompt");
const API_BASE = "https://tutor-production-679f.up.railway.app"; // ✅ 너 Railway 도메인

function placeCaretAtEnd(el){
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

window.addEventListener("load", ()=> editor.focus());

// Enter: 전송, Shift+Enter: 줄바꿈
editor.addEventListener("keydown", (e)=>{
  if (e.isComposing) return;
  if (e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    askAI();
  }
});

async function askAI(){
  const userPrompt = (editor.innerText || "").trim();
  if (!userPrompt) return;

  document.body.classList.add("loading");

  try{
    const res = await fetch(`${API_BASE}/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userPrompt, text: "" }) // text는 호환용
    });

    const raw = await res.text();     // 에러 원인 보이게
    if (!res.ok) throw new Error(`${res.status} ${raw}`);

    const data = JSON.parse(raw);
    editor.innerText = data?.result ?? "";
    placeCaretAtEnd(editor);
  }catch(err){
    console.error(err);
    alert(String(err));
  }finally{
    document.body.classList.remove("loading");
  }
}

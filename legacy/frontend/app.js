const scoresDiv = document.getElementById("scores");
const checksDiv = document.getElementById("checks");

["R1","R2","R3","R4","R5","R6"].forEach(r => {
  scoresDiv.innerHTML += `
    <label>${r}</label>
    <input type="number" id="${r}" min="1" max="10" value="5"><br>
  `;
});

["C1","C2","C3","C4","C5","C6","C7","C8"].forEach(c => {
  checksDiv.innerHTML += `
    <input type="checkbox" id="${c}"> ${c}<br>
  `;
});

document.getElementById("form").onsubmit = async e => {
  e.preventDefault();

  const raw = ["R1","R2","R3","R4","R5","R6"].map(
    r => Number(document.getElementById(r).value)
  );

  const checkboxes = ["C1","C2","C3","C4","C5","C6","C7","C8"]
    .filter(c => document.getElementById(c).checked);

  const payload = {
    judgeId: judgeId.value,
    teamId: teamId.value,
    raw,
    checkboxes,
    description: desc.value
  };

  await fetch("http://localhost:3000/judge/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  alert("Submitted");
};

async function loadLeaderboard() {
  const res = await fetch("http://localhost:3000/admin/leaderboard");
  const data = await res.json();
  output.textContent = JSON.stringify(data, null, 2);
}

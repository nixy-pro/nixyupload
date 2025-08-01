const TOKEN = "fkquI3coDZlGCfeQbpvPKUUyWqupchIt";
let pageLink = "", directLink = "";

function showSelectedFiles() {
  const files = document.getElementById("fileInput").files;
  const nameBox = document.getElementById("fileName");
  nameBox.innerHTML = "";
  if (!files.length) return;
  Array.from(files).forEach((file, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<i class='fa-solid fa-file'></i> <span class='name'>${index + 1}. ${file.name}</span>`;
    nameBox.appendChild(li);
  });
}

async function upload() {
  const files = document.getElementById("fileInput").files;
  const bar = document.getElementById("bar");
  const resultText = document.getElementById("resultText");
  const btnPage = document.querySelector(".btn-copy.page");
  const btnDirect = document.querySelector(".btn-copy.direct");
  const btnQR = document.querySelector(".btn-copy.qr");
  const uploadBtn = document.getElementById("uploadBtn");

  if (!files.length) return alert("Select the file first!");

  uploadBtn.disabled = true;
  resultText.style.display = "none";
  btnPage.style.display = "none";
  btnDirect.style.display = "none";
  btnQR.style.display = "none";
  bar.style.width = "0%";
  bar.textContent = "0%";

  const form = new FormData();
  for (const f of files) form.append("file", f);
  form.append("token", TOKEN);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "https://upload.gofile.io/uploadfile", true);
  xhr.setRequestHeader("Authorization", `Bearer ${TOKEN}`);

  xhr.upload.onprogress = e => {
    if (e.lengthComputable) {
      const pct = Math.floor((e.loaded / e.total) * 100);
      bar.style.width = pct + "%";
      bar.textContent = pct + "%";
    }
  };

  xhr.onload = () => {
    uploadBtn.disabled = false;
    let res;
    try {
      res = JSON.parse(xhr.responseText);
    } catch {
      return showPopup("<i class='fas fa-times-circle'></i> Failed to parse response.");
    }
    if (res.status === "ok") {
      const file = res.data;
      const fileName = file.name || "file.unknown";
      const fileId = file.id;
      const server = file.downloadPage.split(".")[0].split("//")[1].replace("gofile", "store2");
      pageLink = file.downloadPage;
      directLink = `https://${server}.gofile.io/download/web/${fileId}/${fileName}`;

      resultText.style.display = "block";
      btnPage.style.display = "flex";
      btnDirect.style.display = "flex";
      btnQR.style.display = "flex";
    } else {
      showPopup("<i class='fas fa-times-circle'></i> Upload failed.");
    }
  };

  xhr.onerror = () => {
    uploadBtn.disabled = false;
    showPopup("<i class='fas fa-times-circle'></i> Network error.");
  };
  xhr.send(form);
}

function copyLink(type) {
  const text = type === "direct" ? directLink : pageLink;
  navigator.clipboard.writeText(text)
    .then(() => showPopup("<i class='fas fa-check-circle'></i> Coppied!"))
    .catch(() => showPopup("<i class='fas fa-times-circle'></i> Fail!"));
}

function downloadQR() {
  const qr = new QRious({ value: directLink, size: 250 });
  const a = document.createElement("a");
  a.href = qr.toDataURL();
  a.download = "POWERED BY NIXY MINE.png";
  a.click();
}

function showPopup(msg) {
  const pop = document.getElementById("popup");
  pop.innerHTML = msg;
  pop.style.display = "flex";
  clearTimeout(pop.timeout);
  pop.timeout = setTimeout(() => {
    pop.style.display = "none";
  }, 2500);
}

const toggle = document.getElementById("themeToggle");

if(toggle){

toggle.onclick = () => {

document.body.classList.toggle("dark");

localStorage.theme =
document.body.classList.contains("dark")
? "dark"
: "light";

};

}

if(localStorage.theme === "dark"){
document.body.classList.add("dark");
}

// load skins
async function loadSkins(){

const res = await fetch("/skins");

const skins = await res.json();

const gallery = document.getElementById("gallery");

if(!gallery) return;

gallery.innerHTML = "";

skins.forEach(skin => {

gallery.innerHTML += `

<div class="card">

<img src="/uploads/${skin.file}">

<h3>${skin.name}</h3>

</div>

`;

});

}

loadSkins();

// upload
async function uploadSkin(){

const file =
document.getElementById("fileInput").files[0];

const name =
document.getElementById("name").value;

const description =
document.getElementById("description").value;

const formData = new FormData();

formData.append("skin", file);
formData.append("name", name);
formData.append("description", description);

await fetch("/upload", {

method: "POST",
body: formData

});

alert("Uploaded!");

}

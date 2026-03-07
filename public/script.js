// =====================
// AUTH
// =====================

const API = window.location.origin;

async function signup(){
    const username = document.getElementById("signupUsername").value;
    const password = document.getElementById("signupPassword").value;

    const response = await fetch(`${API}/api/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    alert(data.message || JSON.stringify(data));
}


async function login(){
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
        alert("Login successful");
    } else {
        alert(data.message || "Login failed");
    }
}


// =====================
// IMAGE UPLOAD
// =====================

async function uploadImage(){

    const fileInput = document.getElementById("imageInput");

    if(!fileInput.files.length){
        alert("Select an image first");
        return;
    }

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    const response = await fetch(`${API}/upload`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    const data = await response.json();

    const resultDiv = document.getElementById("result");

    resultDiv.innerHTML = `
        <h3>Thumbnail</h3>
        <img src="${API}/${data.thumbnail}" width="300"/>
    `;
}
async function uploadImage() {

const fileInput = document.getElementById("imageInput")

if (!fileInput.files.length) {
alert("Select an image first")
return
}

// detect environment
const API =
location.hostname === "localhost"
? "http://localhost:3000"
: ""

const formData = new FormData()
formData.append("image", fileInput.files[0])

const response = await fetch(`${API}/upload`, {
method: "POST",
body: formData
})

const data = await response.json()

const resultDiv = document.getElementById("result")

resultDiv.innerHTML = `
<h3>Thumbnail</h3>
<img src="${API}/${data.thumbnail}" />
`
}
require("dotenv").config();

async function run() {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    console.log("Available models:\n");
    data.models.forEach(m => {
        console.log(m.name);
    });
}

run();





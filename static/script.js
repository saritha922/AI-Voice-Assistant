

// ==========================================
// ELEMENTS
// ==========================================

const micButton = document.getElementById("micButton");
const userText = document.getElementById("userText");
const aiText = document.getElementById("aiText");
const status = document.getElementById("status");

const historyButton = document.getElementById("historyButton");
const answerBackButton = document.getElementById("answerBackButton");
const historyBackButton = document.getElementById("historyBackButton");

const mainContent = document.getElementById("mainContent");
const historyContent = document.getElementById("historyContent");
const historyList = document.getElementById("historyList");


// ==========================================
// INITIAL SETTINGS
// ==========================================

answerBackButton.style.display = "none";


// ==========================================
// SPEECH RECOGNITION
// ==========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;

if (!SpeechRecognition) {

    status.innerText =
        "❌ Speech recognition is not supported in this browser.";

    micButton.disabled = true;

} else {

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;


    // ==========================================
    // MICROPHONE BUTTON
    // ==========================================

    micButton.addEventListener("click", () => {

        if (isListening) {
            return;
        }

        try {

            userText.innerText = "Listening...";
            aiText.innerText = "Your AI answer will appear here...";

            status.innerText = "🎤 Listening... Speak now";

            recognition.start();

        } catch (error) {

            console.error("Start error:", error);

            status.innerText =
                "❌ Could not start microphone. Try again.";

        }

    });


    // ==========================================
    // RECOGNITION STARTED
    // ==========================================

    recognition.onstart = () => {

        isListening = true;

        status.innerText =
            "🎤 Microphone started. Speak now!";

        console.log("Speech recognition started");

    };


    // ==========================================
    // AUDIO STARTED
    // ==========================================

    recognition.onaudiostart = () => {

        console.log("Audio capture started");

    };


    // ==========================================
    // SOUND DETECTED
    // ==========================================

    recognition.onsoundstart = () => {

        console.log("Sound detected");

    };


    // ==========================================
    // SPEECH DETECTED
    // ==========================================

    recognition.onspeechstart = () => {

        console.log("Speech detected");

        status.innerText =
            "🗣️ Voice detected. Processing...";

    };


    // ==========================================
    // VOICE RECOGNIZED
    // ==========================================

    recognition.onresult = async (event) => {

        let transcript = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            transcript +=
                event.results[i][0].transcript;

        }


        // Show temporary speech

        const latestResult =
            event.results[event.results.length - 1];

        if (!latestResult.isFinal) {

            userText.innerText = transcript;

            status.innerText =
                "🎤 Hearing: " + transcript;

            return;

        }


        transcript = transcript.trim();

        if (!transcript) {

            status.innerText =
                "❌ No voice detected. Please try again.";

            return;

        }


        console.log("User said:", transcript);

        userText.innerText = transcript;

        status.innerText =
            "🤖 Thinking...";


        // ==========================================
        // SEND QUESTION TO FLASK
        // ==========================================

        try {

            const response = await fetch("/ask", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question: transcript
                })

            });


            const data = await response.json();

            console.log("AI response:", data);


            if (!response.ok) {

                throw new Error(
                    data.error || "AI request failed"
                );

            }


            // ==========================================
            // DISPLAY AI ANSWER
            // ==========================================

            aiText.innerText = data.answer;

            status.innerText =
                "✅ Answer received";


            answerBackButton.style.display =
                "block";


            // ==========================================
            // SAVE HISTORY
            // ==========================================

            saveConversation(
                transcript,
                data.answer
            );


            // ==========================================
            // TEXT TO SPEECH
            // ==========================================

            const speech =
                new SpeechSynthesisUtterance(
                    data.answer
                );

            speech.lang = "en-IN";
            speech.rate = 0.95;
            speech.pitch = 1;

            window.speechSynthesis.cancel();

            window.speechSynthesis.speak(speech);


        } catch (error) {

            console.error("AI Error:", error);

            status.innerText =
                "❌ AI Error: " + error.message;

        }

    };


    // ==========================================
    // SPEECH ERROR
    // ==========================================

    recognition.onerror = (event) => {

        console.error(
            "Speech recognition error:",
            event.error
        );

        status.innerText =
            "❌ " + event.error;

    };


    // ==========================================
    // RECOGNITION ENDED
    // ==========================================

    recognition.onend = () => {

        isListening = false;

        console.log("Speech recognition ended");

    };

}


// ==========================================
// CONVERSATION HISTORY
// ==========================================

let conversationHistory = [];

try {

    conversationHistory =
        JSON.parse(
            localStorage.getItem("aiVoiceHistory")
        ) || [];

} catch (error) {

    console.error("History loading error:", error);

    conversationHistory = [];

}


// ==========================================
// SAVE CONVERSATION
// ==========================================

function saveConversation(question, answer) {

    conversationHistory.push({

        question: question,

        answer: answer,

        time: new Date().toLocaleString()

    });


    localStorage.setItem(
        "aiVoiceHistory",
        JSON.stringify(conversationHistory)
    );

}


// ==========================================
// DISPLAY HISTORY
// ==========================================

function displayHistory() {

    if (conversationHistory.length === 0) {

        historyList.innerHTML =
            "📭 No conversations yet.";

        return;

    }


    historyList.innerHTML = "";


    conversationHistory.forEach((item) => {

        const conversation =
            document.createElement("div");


        conversation.style.marginBottom = "20px";


        const questionTitle =
            document.createElement("strong");

        questionTitle.innerText = "👤 You:";


        const questionText =
            document.createElement("p");

        questionText.textContent = item.question;


        const answerTitle =
            document.createElement("strong");

        answerTitle.innerText = "🤖 AI:";


        const answerText =
            document.createElement("p");

        answerText.textContent = item.answer;


        const timeText =
            document.createElement("small");

        timeText.textContent = "🕒 " + item.time;


        const line =
            document.createElement("hr");


        conversation.appendChild(questionTitle);
        conversation.appendChild(questionText);
        conversation.appendChild(answerTitle);
        conversation.appendChild(answerText);
        conversation.appendChild(timeText);
        conversation.appendChild(line);


        historyList.appendChild(conversation);

    });

}


// ==========================================
// OPEN HISTORY
// ==========================================

historyButton.addEventListener("click", () => {

    mainContent.style.display = "none";

    historyContent.style.display = "block";

    displayHistory();

});


// ==========================================
// BACK FROM HISTORY
// ==========================================

historyBackButton.addEventListener("click", () => {

    historyContent.style.display = "none";

    mainContent.style.display = "block";

});


// ==========================================
// BACK AFTER AI ANSWER
// ==========================================

answerBackButton.addEventListener("click", () => {

    // Stop AI voice

    window.speechSynthesis.cancel();


    // Clear question

    userText.innerText =
        "Your question will appear here...";


    // Clear answer

    aiText.innerText =
        "Your AI answer will appear here...";


    // Reset status

    status.innerText =
        "Click the microphone and speak";


    // Hide back button

    answerBackButton.style.display =
        "none";

});

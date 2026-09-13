// ===============================
// FIREBASE CONFIGURATION
// ===============================

const firebaseConfig = {
    apiKey: "AIzaSyBTZ8MtXcBJan5ZNk1N_88P-7NRRfatREg",
    authDomain: "farmswap-9f92e.firebaseapp.com",
    projectId: "farmswap-9f92e",
    storageBucket: "farmswap-9f92e.firebasestorage.app",
    messagingSenderId: "1008224880479",
    appId: "1:1008224880479:web:5eb44a9175c626784158ea"
};

// Start Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();


// ===============================
// VARIABLES
// ===============================

let currentMatch = null;


// ===============================
// ANONYMOUS LOGIN
// ===============================

firebase.auth().signInAnonymously()
    .then(() => {
        console.log("FarmSwap connected to Firebase");
        loadProducts();
        loadRequests();
    })
    .catch((error) => {
        console.error("Firebase login error:", error);
    });


// ===============================
// SHOW FARMER FORM
// ===============================

function showFarmer() {
    document.getElementById("farmerSection").scrollIntoView({
        behavior: "smooth"
    });
}


// ===============================
// SHOW REQUESTER FORM
// ===============================

function showRequester() {
    document.getElementById("requesterSection").scrollIntoView({
        behavior: "smooth"
    });
}


// ===============================
// FARMER SUBMIT
// ===============================

function submitFarmer(event) {

    event.preventDefault();

    const name = document.getElementById("farmerName").value.trim();
    const phone = document.getElementById("farmerPhone").value.trim();
    const location = document.getElementById("farmerLocation").value.trim();
    const product = document.getElementById("farmerProduct").value.trim();
    const quantity = Number(document.getElementById("farmerQuantity").value);
    const price = Number(document.getElementById("farmerPrice").value);
    const need = document.getElementById("farmerNeed").value.trim();

    if (!name || !phone || !location || !product || quantity <= 0 || price < 0) {
        alert("Please fill all required fields correctly.");
        return;
    }

    const user = firebase.auth().currentUser;

    db.collection("products").add({
        farmerName: name,
        farmerPhone: phone,
        farmerLocation: location,
        farmerProduct: product,
        farmerQuantity: quantity,
        farmerPrice: price,
        farmerNeed: need,
        uid: user ? user.uid : null,
        status: "available",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {

        alert("Product added successfully! 🌾");

        document.getElementById("farmerProduct").value = "";
        document.getElementById("farmerQuantity").value = "";
        document.getElementById("farmerPrice").value = "";
        document.getElementById("farmerNeed").value = "";

    })
    .catch((error) => {
        console.error(error);
        alert("Could not add product.");
    });
}


// ===============================
// REQUESTER SUBMIT
// ===============================

function submitRequester(event) {

    event.preventDefault();

    const name = document.getElementById("requesterName").value.trim();
    const phone = document.getElementById("requesterPhone").value.trim();
    const location = document.getElementById("requesterLocation").value.trim();
    const product = document.getElementById("neededProduct").value.trim();
    const quantity = Number(document.getElementById("neededQuantity").value);
    const maxPrice = Number(document.getElementById("maxPrice").value);
    const exchangeProduct = document.getElementById("exchangeProduct").value.trim();

    if (!name || !phone || !location || !product || quantity <= 0 || maxPrice < 0) {
        alert("Please fill all required fields correctly.");
        return;
    }

    const user = firebase.auth().currentUser;

    db.collection("requests").add({
        requesterName: name,
        requesterPhone: phone,
        requesterLocation: location,
        neededProduct: product,
        neededQuantity: quantity,
        maxPrice: maxPrice,
        exchangeProduct: exchangeProduct,
        uid: user ? user.uid : null,
        status: "active",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {

        alert("Request added successfully! 🔎");

        document.getElementById("neededProduct").value = "";
        document.getElementById("neededQuantity").value = "";
        document.getElementById("maxPrice").value = "";
        document.getElementById("exchangeProduct").value = "";

    })
    .catch((error) => {
        console.error(error);
        alert("Could not add request.");
    });
}


// ===============================
// LOAD PRODUCTS
// ===============================

function loadProducts() {

    db.collection("products")
        .where("status", "==", "available")
        .onSnapshot((snapshot) => {

            const container = document.getElementById("farmerListings");

            if (!container) return;

            container.innerHTML = "";

            snapshot.forEach((doc) => {

                const data = doc.data();

                container.innerHTML += `
                    <div class="listing-card">
                        <h3>🌾 ${escapeHTML(data.farmerProduct)}</h3>
                        <p><strong>Farmer:</strong> ${escapeHTML(data.farmerName)}</p>
                        <p><strong>Location:</strong> ${escapeHTML(data.farmerLocation)}</p>
                        <p><strong>Available:</strong> ${data.farmerQuantity}</p>
                        <p><strong>Price:</strong> ₹${data.farmerPrice}</p>
                    </div>
                `;
            });

            checkAllMatches();
        });
}


// ===============================
// LOAD REQUESTS
// ===============================

function loadRequests() {

    db.collection("requests")
        .where("status", "==", "active")
        .onSnapshot((snapshot) => {

            const container = document.getElementById("requesterListings");

            if (!container) return;

            container.innerHTML = "";

            snapshot.forEach((doc) => {

                const data = doc.data();

                container.innerHTML += `
                    <div class="listing-card">
                        <h3>🔎 ${escapeHTML(data.neededProduct)}</h3>
                        <p><strong>Requester:</strong> ${escapeHTML(data.requesterName)}</p>
                        <p><strong>Location:</strong> ${escapeHTML(data.requesterLocation)}</p>
                        <p><strong>Required:</strong> ${data.neededQuantity}</p>
                        <p><strong>Maximum Price:</strong> ₹${data.maxPrice}</p>
                    </div>
                `;
            });

            checkAllMatches();
        });
}


// ===============================
// CHECK ALL MATCHES
// ===============================

async function checkAllMatches() {

    try {

        const productsSnapshot = await db.collection("products")
            .where("status", "==", "available")
            .get();

        const requestsSnapshot = await db.collection("requests")
            .where("status", "==", "active")
            .get();

        let bestMatch = null;
        let bestScore = 0;

        productsSnapshot.forEach((productDoc) => {

            const product = productDoc.data();

            requestsSnapshot.forEach((requestDoc) => {

                const request = requestDoc.data();

                // Don't match the same user with themselves
                if (product.uid && request.uid && product.uid === request.uid) {
                    return;
                }

                const score = calculateMatchScore(product, request);

                if (score > bestScore) {

                    bestScore = score;

                    bestMatch = {
                        productId: productDoc.id,
                        requestId: requestDoc.id,
                        product: product,
                        request: request,
                        score: score
                    };
                }
            });
        });

        if (bestMatch && bestScore >= 60) {

            currentMatch = bestMatch;

            showMatch(bestMatch);

        }

    } catch (error) {

        console.error("Matching error:", error);

    }
}


// ===============================
// MATCH SCORE
// ===============================

function calculateMatchScore(product, request) {

    let score = 0;

    const farmerProduct = product.farmerProduct.toLowerCase();
    const neededProduct = request.neededProduct.toLowerCase();

    const farmerLocation = product.farmerLocation.toLowerCase();
    const requesterLocation = request.requesterLocation.toLowerCase();

    // Product match
    if (
        farmerProduct.includes(neededProduct) ||
        neededProduct.includes(farmerProduct)
    ) {
        score += 40;
    }

    // Quantity match
    if (product.farmerQuantity >= request.neededQuantity) {
        score += 20;
    }

    // Price match
    if (product.farmerPrice <= request.maxPrice) {
        score += 20;
    }

    // Location match
    if (
        farmerLocation === requesterLocation ||
        farmerLocation.includes(requesterLocation) ||
        requesterLocation.includes(farmerLocation)
    ) {
        score += 20;
    }

    return score;
}


// ===============================
// SHOW MATCH
// ===============================

function showMatch(match) {

    const matchSection = document.getElementById("match");
    const matchResult = document.getElementById("matchResult");

    if (!matchSection || !matchResult) return;

    matchSection.style.display = "block";

    matchResult.innerHTML = `
        <div class="match-card">

            <h2>🎉 Match Found!</h2>

            <p><strong>Product:</strong>
                ${escapeHTML(match.product.farmerProduct)}
            </p>

            <p><strong>Farmer:</strong>
                ${escapeHTML(match.product.farmerName)}
            </p>

            <p><strong>Requester:</strong>
                ${escapeHTML(match.request.requesterName)}
            </p>

            <p><strong>Quantity:</strong>
                ${match.request.neededQuantity}
            </p>

            <p><strong>Price:</strong>
                ₹${match.product.farmerPrice}
            </p>

            <p><strong>Match Score:</strong>
                ${match.score}%
            </p>

            <button onclick="connectUsers()">
                🤝 Connect
            </button>

        </div>
    `;

    matchSection.scrollIntoView({
        behavior: "smooth"
    });
}


// ===============================
// CONNECT USERS
// ===============================

async function connectUsers() {

    if (!currentMatch) {
        alert("No match available.");
        return;
    }

    const productRef = db.collection("products")
        .doc(currentMatch.productId);

    const requestRef = db.collection("requests")
        .doc(currentMatch.requestId);

    try {

        await db.runTransaction(async (transaction) => {

            const productDoc = await transaction.get(productRef);
            const requestDoc = await transaction.get(requestRef);

            if (!productDoc.exists || !requestDoc.exists) {
                throw new Error("Product or request no longer exists.");
            }

            const product = productDoc.data();
            const request = requestDoc.data();

            if (product.status !== "available") {
                throw new Error("This product is no longer available.");
            }

            if (request.status !== "active") {
                throw new Error("This request has already been completed.");
            }

            if (product.farmerQuantity < request.neededQuantity) {
                throw new Error("Not enough quantity available.");
            }

            const remainingQuantity =
                product.farmerQuantity - request.neededQuantity;

            transaction.update(requestRef, {
                status: "completed",
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            transaction.update(productRef, {
                farmerQuantity: remainingQuantity,
                status: remainingQuantity > 0 ? "available" : "sold"
            });
        });

        alert(
            "Connected successfully! 🤝\n\n" +
            "The request is completed and the farmer's remaining quantity has been updated."
        );

        currentMatch = null;

        document.getElementById("matchResult").innerHTML = "";

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
}


// ===============================
// SECURITY HELPER
// ===============================

function escapeHTML(value) {

    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

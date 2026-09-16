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
    document.getElementById("farmerForm").style.display = "block";
    document.getElementById("requesterForm").style.display = "none";

    document.getElementById("farmerForm").scrollIntoView({
        behavior: "smooth"
    });
}

function showRequester() {
    document.getElementById("requesterForm").style.display = "block";
    document.getElementById("farmerForm").style.display = "none";

    document.getElementById("requesterForm").scrollIntoView({
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
    const category = document.getElementById("farmerCategory").value;
    const quantity = Number(document.getElementById("farmerQuantity").value);
    const price = Number(document.getElementById("farmerPrice").value);
    const need = document.getElementById("farmerNeed").value.trim();

    if (!name || !phone || !location || !product || !category || quantity <= 0 || price < 0) {
        alert("Please fill all required fields correctly.");
        return;
    }

    const user = firebase.auth().currentUser;

    db.collection("products").add({
        farmerName: name,
        farmerPhone: phone,
        farmerLocation: location,
       farmerProduct: product,
category: category,
farmerQuantity: quantity,
        farmerPrice: price,
        farmerNeed: need,
        uid: user ? user.uid : null,
        status: "available",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {

        alert("Product added successfully! 🌾");
        goHome();

        document.getElementById("farmerProduct").value = "";
        document.getElementById("farmerCategory").value = "";
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
    const category = document.getElementById("requestCategory").value;
    const quantity = Number(document.getElementById("neededQuantity").value);
    const maxPrice = Number(document.getElementById("maxPrice").value);
    const exchangeProduct = document.getElementById("exchangeProduct").value.trim();

   if (!name || !phone || !location || !product || !category || quantity <= 0 || maxPrice < 0) {
        alert("Please fill all required fields correctly.");
        return;
    }

    const user = firebase.auth().currentUser;

    db.collection("requests").add({
        requesterName: name,
        requesterPhone: phone,
        requesterLocation: location,
        neededProduct: product,
category: category,
neededQuantity: quantity,
        maxPrice: maxPrice,
        exchangeProduct: exchangeProduct,
        uid: user ? user.uid : null,
        status: "active",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {

        alert("Request added successfully! 🔎");
        goHome();

        document.getElementById("neededProduct").value = "";
        document.getElementById("neededQuantity").value = "";
        document.getElementById("requestCategory").value = "";
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
            const quickContainer =
                document.getElementById("quickProductButtons");

            // -------------------------------
            // FARMER LISTINGS
            // -------------------------------

            if (container) {

                container.innerHTML = "";

                snapshot.forEach((doc) => {

                    const data = doc.data();

                    container.innerHTML += `
                        <div class="listing-card">

                            <h3>🌾 ${escapeHTML(data.farmerProduct)}</h3>

                            <p>
                                <strong>Category:</strong>
                                ${escapeHTML(data.category || "Others")}
                            </p>

                            <p>
                                <strong>Farmer:</strong>
                                ${escapeHTML(data.farmerName)}
                            </p>

                            <p>
                                <strong>Location:</strong>
                                ${escapeHTML(data.farmerLocation)}
                            </p>

                            <p>
                                <strong>Available:</strong>
                                ${data.farmerQuantity}
                            </p>

                            <p>
                                <strong>Price:</strong>
                                ₹${data.farmerPrice}
                            </p>

                        </div>
                    `;
                });
            }


            // -------------------------------
            // QUICK PRODUCTS ON HOME
            // -------------------------------

            if (quickContainer) {

                quickContainer.innerHTML = "";

                const categories = {};

                snapshot.forEach((doc) => {

                    const data = doc.data();

                    const productName =
                        (data.farmerProduct || "").trim();

                    const category =
                        data.category || "Others";

                    if (!productName) return;

                    if (!categories[category]) {
                        categories[category] = [];
                    }

                    // Avoid duplicate product names
                    const exists = categories[category].some(
                        product =>
                            product.toLowerCase() ===
                            productName.toLowerCase()
                    );

                    if (!exists) {
                        categories[category].push(productName);
                    }

                });


                const categoryNames =
                    Object.keys(categories);


                if (categoryNames.length === 0) {

                    quickContainer.innerHTML = `
                        <p>
                            No products available yet.
                            Be the first farmer to add one! 🌱
                        </p>
                    `;

                } else {

                    categoryNames.forEach((category) => {

                        const categoryBox =
                            document.createElement("div");

                        categoryBox.className =
                            "category-box";

                        categoryBox.innerHTML = `
                            <h4>${escapeHTML(category)}</h4>
                        `;

                        const buttonContainer =
                            document.createElement("div");

                        buttonContainer.className =
                            "product-buttons";


                        categories[category].forEach(
                            (productName) => {

                                const button =
                                    document.createElement("button");

                                button.type = "button";

                                button.textContent =
                                    "🌾 " + productName;

                                button.onclick = function () {

                                    selectProduct(productName);

                                    // Automatically select category
                                    const categoryInput =
                                        document.getElementById(
                                            "requestCategory"
                                        );

                                    if (categoryInput) {
                                        categoryInput.value =
                                            category;
                                    }

                                };

                                buttonContainer.appendChild(button);

                            }
                        );


                        categoryBox.appendChild(
                            buttonContainer
                        );

                        quickContainer.appendChild(
                            categoryBox
                        );

                    });

                }

            }


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

            const container =
                document.getElementById("requesterListings");

            const quickContainer =
                document.getElementById("quickRequestButtons");


            // -------------------------------
            // REQUEST LISTINGS
            // -------------------------------

            if (container) {

                container.innerHTML = "";

                snapshot.forEach((doc) => {

                    const data = doc.data();

                    container.innerHTML += `
                        <div class="listing-card">

                            <h3>
                                🔎 ${escapeHTML(data.neededProduct)}
                            </h3>

                            <p>
                                <strong>Category:</strong>
                                ${escapeHTML(data.category || "Others")}
                            </p>

                            <p>
                                <strong>Requester:</strong>
                                ${escapeHTML(data.requesterName)}
                            </p>

                            <p>
                                <strong>Location:</strong>
                                ${escapeHTML(data.requesterLocation)}
                            </p>

                            <p>
                                <strong>Required:</strong>
                                ${data.neededQuantity}
                            </p>

                            <p>
                                <strong>Maximum Price:</strong>
                                ₹${data.maxPrice}
                            </p>

                        </div>
                    `;
                });
            }


            // -------------------------------
            // REQUESTS ON HOME
            // -------------------------------

            if (quickContainer) {

                quickContainer.innerHTML = "";

                const categories = {};


                snapshot.forEach((doc) => {

                    const data = doc.data();

                    const productName =
                        (data.neededProduct || "").trim();

                    const category =
                        data.category || "Others";

                    if (!productName) return;

                    if (!categories[category]) {
                        categories[category] = [];
                    }

                    categories[category].push({
                        product: productName,
                        quantity: data.neededQuantity
                    });

                });


                const categoryNames =
                    Object.keys(categories);


                if (categoryNames.length === 0) {

                    quickContainer.innerHTML = `
                        <p>
                            No active requests yet. 🔎
                        </p>
                    `;

                } else {

                    categoryNames.forEach((category) => {

                        const categoryBox =
                            document.createElement("div");

                        categoryBox.className =
                            "category-box";

                        categoryBox.innerHTML = `
                            <h4>${escapeHTML(category)}</h4>
                        `;


                        categories[category].forEach(
                            (request) => {

                                const requestCard =
                                    document.createElement("div");

                                requestCard.className =
                                    "request-card";

                                requestCard.innerHTML = `
                                    <p>
                                        🔎 <strong>
                                        Need ${escapeHTML(request.product)}
                                        </strong>
                                    </p>

                                    <p>
                                        Quantity:
                                        ${request.quantity}
                                    </p>
                                `;

                                categoryBox.appendChild(
                                    requestCard
                                );

                            }
                        );


                        quickContainer.appendChild(
                            categoryBox
                        );

                    });

                }

            }


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
    const farmerCategory =
    (product.category || "").toLowerCase();

const requesterCategory =
    (request.category || "").toLowerCase();

    let score = 0;

    const farmerProduct = product.farmerProduct.toLowerCase();
    const neededProduct = request.neededProduct.toLowerCase();

    const farmerLocation = product.farmerLocation.toLowerCase();
    const requesterLocation = request.requesterLocation.toLowerCase();
    
    // Category match
if (
    farmerCategory &&
    requesterCategory &&
    farmerCategory === requesterCategory
) {
    score += 20;
}

    
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

  return Math.min(score, 100);
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

    const match = currentMatch;

    const productRef = db.collection("products")
        .doc(match.productId);

    const requestRef = db.collection("requests")
        .doc(match.requestId);

    try {

        await db.runTransaction(async (transaction) => {

            const productDoc = await transaction.get(productRef);
            const requestDoc = await transaction.get(requestRef);

            if (!productDoc.exists || !requestDoc.exists) {
                throw new Error("Product or request no longer exists.");
            }

            const product = productDoc.data();
            const request = requestDoc.data();

            // Make sure nobody already connected them
            if (product.status !== "available") {
                throw new Error("This product is already sold.");
            }

            if (request.status !== "active") {
                throw new Error("This request is already completed.");
            }

            if (product.farmerQuantity < request.neededQuantity) {
                throw new Error("Not enough quantity available.");
            }

            const remainingQuantity =
                product.farmerQuantity - request.neededQuantity;

            // Complete the request
            transaction.update(requestRef, {
                status: "completed",
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update product
            transaction.update(productRef, {

                farmerQuantity: remainingQuantity,

                // If nothing remains → remove from available list
                status: remainingQuantity > 0
                    ? "available"
                    : "sold"
            });

        });

        // Clear current match
        currentMatch = null;

        // Hide match section
        const matchSection = document.getElementById("match");

        if (matchSection) {
            matchSection.style.display = "none";
        }

        // Go back to Home
        goHome();

        alert(
            "Connected successfully! 🤝\n\n" +
            "The matched request is completed."
        );

    } catch (error) {

        console.error("Connection error:", error);

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
// ===============================
// QUICK PRODUCT SELECTION
// ===============================

function selectProduct(productName) {

    // Open requester form
    showRequester();

    // Automatically fill the product
    const productInput = document.getElementById("neededProduct");

    if (productInput) {
        productInput.value = productName;
        productInput.focus();
    }
}
// ===============================
// RETURN TO HOME
// ===============================

function goHome() {

    const farmerForm = document.getElementById("farmerForm");
    const requesterForm = document.getElementById("requesterForm");

    if (farmerForm) {
        farmerForm.style.display = "none";
    }

    if (requesterForm) {
        requesterForm.style.display = "none";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

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

        // Only load these on the HOME page
        if (document.getElementById("farmerListings")) {
            loadProducts();
        }

        if (document.getElementById("requesterListings")) {
            loadRequests();
        }

        // Load match page if we are on match.html
        loadMatchPage();

    })
    .catch((error) => {

        console.error("Firebase login error:", error);

    });


// ===============================
// SHOW FARMER FORM
// ===============================

function showFarmer() {

    const farmerForm = document.getElementById("farmerForm");
    const requesterForm = document.getElementById("requesterForm");

    if (!farmerForm) return;

    farmerForm.style.display = "block";

    if (requesterForm) {
        requesterForm.style.display = "none";
    }

    farmerForm.scrollIntoView({
        behavior: "smooth"
    });
}


// ===============================
// SHOW REQUESTER FORM
// ===============================

function showRequester() {

    const requesterForm = document.getElementById("requesterForm");
    const farmerForm = document.getElementById("farmerForm");

    if (!requesterForm) return;

    requesterForm.style.display = "block";

    if (farmerForm) {
        farmerForm.style.display = "none";
    }

    requesterForm.scrollIntoView({
        behavior: "smooth"
    });
}


// ===============================
// FARMER SUBMIT
// ===============================

function submitFarmer(event) {

    event.preventDefault();

    const name =
        document.getElementById("farmerName").value.trim();

    const phone =
        document.getElementById("farmerPhone").value.trim();

    const location =
        document.getElementById("farmerLocation").value.trim();

    const product =
        document.getElementById("farmerProduct").value.trim();

    const category =
        document.getElementById("farmerCategory").value;

    const quantity =
        Number(document.getElementById("farmerQuantity").value);

    const price =
        Number(document.getElementById("farmerPrice").value);

    const need =
        document.getElementById("farmerNeed").value.trim();


    if (
        !name ||
        !phone ||
        !location ||
        !product ||
        !category ||
        quantity <= 0 ||
        price < 0
    ) {

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

        createdAt:
            firebase.firestore.FieldValue.serverTimestamp()

    })

    .then(() => {

        alert("Product added successfully! 🌾");

        document.getElementById("farmerProduct").value = "";
        document.getElementById("farmerCategory").value = "";
        document.getElementById("farmerQuantity").value = "";
        document.getElementById("farmerPrice").value = "";
        document.getElementById("farmerNeed").value = "";

        goHome();

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

    const name =
        document.getElementById("requesterName").value.trim();

    const phone =
        document.getElementById("requesterPhone").value.trim();

    const location =
        document.getElementById("requesterLocation").value.trim();

    const product =
        document.getElementById("neededProduct").value.trim();

    const category =
        document.getElementById("requestCategory").value;

    const quantity =
        Number(document.getElementById("neededQuantity").value);

    const maxPrice =
        Number(document.getElementById("maxPrice").value);

    const exchangeProduct =
        document.getElementById("exchangeProduct").value.trim();


    if (
        !name ||
        !phone ||
        !location ||
        !product ||
        !category ||
        quantity <= 0 ||
        maxPrice < 0
    ) {

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

        createdAt:
            firebase.firestore.FieldValue.serverTimestamp()

    })

    .then(() => {

        alert("Request added successfully! 🔎");

        document.getElementById("neededProduct").value = "";
        document.getElementById("neededQuantity").value = "";
        document.getElementById("requestCategory").value = "";
        document.getElementById("maxPrice").value = "";
        document.getElementById("exchangeProduct").value = "";

        goHome();

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

            const container =
                document.getElementById("farmerListings");

            const quickContainer =
                document.getElementById("quickProductButtons");


            // -------------------------------
            // AVAILABLE PRODUCTS
            // -------------------------------

            if (container) {

                container.innerHTML = "";

                snapshot.forEach((doc) => {

                    const data = doc.data();

                    container.innerHTML += `

                        <div class="listing-card">

                            <h3>
                                🌾 ${escapeHTML(data.farmerProduct)}
                            </h3>

                            <p>
                                <strong>Category:</strong>
                                ${escapeHTML(
                                    data.category || "Others"
                                )}
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
            // QUICK PRODUCTS
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


                    const exists =
                        categories[category].some(
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

                            <h4>
                                ${escapeHTML(category)}
                            </h4>

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


            if (container) {

                container.innerHTML = "";

                snapshot.forEach((doc) => {

                    const data = doc.data();

                    container.innerHTML += `

                        <div class="listing-card">

                            <h3>
                                🔎
                                ${escapeHTML(
                                    data.neededProduct
                                )}
                            </h3>

                            <p>
                                <strong>Category:</strong>
                                ${escapeHTML(
                                    data.category || "Others"
                                )}
                            </p>

                            <p>
                                <strong>Requester:</strong>
                                ${escapeHTML(
                                    data.requesterName
                                )}
                            </p>

                            <p>
                                <strong>Location:</strong>
                                ${escapeHTML(
                                    data.requesterLocation
                                )}
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


            checkAllMatches();

        });
}


// ===============================
// CHECK ALL MATCHES
// ===============================

async function checkAllMatches() {

    // Do NOT check for matches on match.html
    if (document.getElementById("matchResult")) {
        return;
    }


    // Prevent repeated opening
    if (currentMatch) {
        return;
    }


    try {

        const productsSnapshot =
            await db.collection("products")
                .where("status", "==", "available")
                .get();


        const requestsSnapshot =
            await db.collection("requests")
                .where("status", "==", "active")
                .get();


        if (
            productsSnapshot.empty ||
            requestsSnapshot.empty
        ) {
            return;
        }


        let bestMatch = null;
        let bestScore = 0;


        productsSnapshot.forEach((productDoc) => {

            const product =
                productDoc.data();


            requestsSnapshot.forEach((requestDoc) => {

                const request =
                    requestDoc.data();


                const score =
                    calculateMatchScore(
                        product,
                        request
                    );


                if (
                    score >= 60 &&
                    score > bestScore
                ) {

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


        if (bestMatch) {

            currentMatch = bestMatch;

            showMatch(bestMatch);

        }

    }
    catch (error) {

        console.error(
            "Matching error:",
            error
        );

    }
}


// ===============================
// MATCH SCORE
// ===============================

function calculateMatchScore(product, request) {

    const farmerProduct =
        (product.farmerProduct || "")
            .trim()
            .toLowerCase();


    const neededProduct =
        (request.neededProduct || "")
            .trim()
            .toLowerCase();


    const farmerCategory =
        (product.category || "")
            .trim()
            .toLowerCase();


    const requesterCategory =
        (request.category || "")
            .trim()
            .toLowerCase();


    let score = 0;


    // PRODUCT — 40 POINTS

    if (
        farmerProduct === neededProduct ||
        farmerProduct.includes(neededProduct) ||
        neededProduct.includes(farmerProduct)
    ) {

        score += 40;

    }


    // CATEGORY — 20 POINTS

    if (
        farmerCategory &&
        requesterCategory &&
        farmerCategory === requesterCategory
    ) {

        score += 20;

    }


    // QUANTITY — 20 POINTS

    if (
        Number(product.farmerQuantity) >=
        Number(request.neededQuantity)
    ) {

        score += 20;

    }


    // PRICE — 20 POINTS

    if (
        Number(product.farmerPrice) <=
        Number(request.maxPrice)
    ) {

        score += 20;

    }


    return score;
}


// ===============================
// SHOW MATCH ON SEPARATE PAGE
// ===============================

function showMatch(match) {

    sessionStorage.setItem(
        "currentMatch",
        JSON.stringify(match)
    );


    window.location.href =
        "match.html";
}


// ===============================
// LOAD MATCH PAGE
// ===============================

function loadMatchPage() {

    const matchResult =
        document.getElementById("matchResult");


    // Not match.html
    if (!matchResult) {
        return;
    }


    const savedMatch =
        sessionStorage.getItem(
            "currentMatch"
        );


    // No match saved
    if (!savedMatch) {

        window.location.href =
            "index.html";

        return;
    }


    try {

        currentMatch =
            JSON.parse(savedMatch);

    }
    catch (error) {

        console.error(
            "Could not load match:",
            error
        );

        sessionStorage.removeItem(
            "currentMatch"
        );

        window.location.href =
            "index.html";

        return;
    }


    const match =
        currentMatch;


    matchResult.innerHTML = `

        <div class="match-card">

            <p>
                <strong>Product:</strong>
                ${escapeHTML(
                    match.product.farmerProduct
                )}
            </p>

            <p>
                <strong>Farmer:</strong>
                ${escapeHTML(
                    match.product.farmerName
                )}
            </p>

            <p>
                <strong>Requester:</strong>
                ${escapeHTML(
                    match.request.requesterName
                )}
            </p>

            <p>
                <strong>Quantity:</strong>
                ${match.request.neededQuantity}
            </p>

            <p>
                <strong>Price:</strong>
                ₹${match.product.farmerPrice}
            </p>

            <p>
                <strong>Match Score:</strong>
                ${match.score}%
            </p>

        </div>

    `;
}


// ===============================
// CONNECT USERS
// ===============================

// ===============================
// CONNECT USERS
// ===============================

async function connectUsers() {

    if (!currentMatch) {
        window.location.href = "index.html";
        return;
    }

    const match = currentMatch;

    const productRef = db.collection("products")
        .doc(match.productId);

    const requestRef = db.collection("requests")
        .doc(match.requestId);

    try {

        await db.runTransaction(async (transaction) => {

            const productDoc =
                await transaction.get(productRef);

            const requestDoc =
                await transaction.get(requestRef);

            if (!productDoc.exists || !requestDoc.exists) {
                return;
            }

            const product = productDoc.data();
            const request = requestDoc.data();

            if (
                product.status !== "available" ||
                request.status !== "active"
            ) {
                return;
            }

            const availableQuantity =
                Number(product.farmerQuantity);

            const requestedQuantity =
                Number(request.neededQuantity);

            // If quantity is not enough, just stop.
            if (availableQuantity < requestedQuantity) {
                return;
            }

            const remainingQuantity =
                availableQuantity - requestedQuantity;

            transaction.update(requestRef, {
                status: "completed",
                completedAt:
                    firebase.firestore.FieldValue.serverTimestamp()
            });

            transaction.update(productRef, {
                farmerQuantity: remainingQuantity,
                status: remainingQuantity > 0
                    ? "available"
                    : "sold"
            });

        });

        // Clear match
        currentMatch = null;
        sessionStorage.removeItem("currentMatch");

        // GO HOME
        window.location.href = "index.html";

    }
    catch (error) {

        console.error("Connection error:", error);

        // Even if something goes wrong, go Home
        currentMatch = null;
        sessionStorage.removeItem("currentMatch");

        window.location.href = "index.html";
    }
}
// ===============================
// SECURITY HELPER
// ===============================

function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


// ===============================
// QUICK PRODUCT SELECTION
// ===============================

function selectProduct(productName) {

    showRequester();


    const productInput =
        document.getElementById(
            "neededProduct"
        );


    if (productInput) {

        productInput.value =
            productName;

        productInput.focus();

    }
}


// ===============================
// RETURN TO HOME
// ===============================

function goHome() {

    const farmerForm =
        document.getElementById(
            "farmerForm"
        );


    const requesterForm =
        document.getElementById(
            "requesterForm"
        );


    if (farmerForm) {

        farmerForm.style.display =
            "none";

    }


    if (requesterForm) {

        requesterForm.style.display =
            "none";

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

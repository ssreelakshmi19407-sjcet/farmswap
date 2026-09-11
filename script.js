/*

    FARMSWAP SMART MATCHING SYSTEM

*/


let farmerData = null;

let requesterData = null;



/* SHOW FARMER FORM */

function showFarmer() {

    document.getElementById("farmerForm")
        .style.display = "block";

    document.getElementById("requesterForm")
        .style.display = "none";

    document.getElementById("farmerForm")
        .scrollIntoView({
            behavior: "smooth"
        });

}



/* SHOW REQUESTER FORM */

function showRequester() {

    document.getElementById("requesterForm")
        .style.display = "block";

    document.getElementById("farmerForm")
        .style.display = "none";

    document.getElementById("requesterForm")
        .scrollIntoView({
            behavior: "smooth"
        });

}



/* FARMER SUBMISSION */

function submitFarmer(event) {

    event.preventDefault();


    farmerData = {

        name:
            document.getElementById(
                "farmerName"
            ).value,

        phone:
            document.getElementById(
                "farmerPhone"
            ).value,

        location:
            document.getElementById(
                "farmerLocation"
            ).value,

        product:
            document.getElementById(
                "farmerProduct"
            ).value.toLowerCase(),

        quantity:
            Number(
                document.getElementById(
                    "farmerQuantity"
                ).value
            ),

        price:
            Number(
                document.getElementById(
                    "farmerPrice"
                ).value
            ),

        need:
            document.getElementById(
                "farmerNeed"
            ).value

    };


    alert(
        "Your produce has been added to FarmSwap! 🌱"
    );


    document.getElementById(
        "farmerForm"
    ).style.display = "none";


    checkMatch();

}



/* REQUEST SUBMISSION */

function submitRequester(event) {

    event.preventDefault();


    requesterData = {

        name:
            document.getElementById(
                "requesterName"
            ).value,

        phone:
            document.getElementById(
                "requesterPhone"
            ).value,

        location:
            document.getElementById(
                "requesterLocation"
            ).value,

        product:
            document.getElementById(
                "neededProduct"
            ).value.toLowerCase(),

        quantity:
            Number(
                document.getElementById(
                    "neededQuantity"
                ).value
            ),

        maxPrice:
            Number(
                document.getElementById(
                    "maxPrice"
                ).value
            ),

        exchange:
            document.getElementById(
                "exchangeProduct"
            ).value

    };


    document.getElementById(
        "requesterForm"
    ).style.display = "none";


    alert(
        "Request received! 🤖 Searching for matches..."
    );


    checkMatch();

}



/* SMART MATCHING */

function checkMatch() {

    if (
        farmerData === null ||
        requesterData === null
    ) {

        return;

    }


    let score = 0;



    /* PRODUCT MATCH */

    if (
        farmerData.product
        .includes(
            requesterData.product
        )
        ||
        requesterData.product
        .includes(
            farmerData.product
        )
    ) {

        score += 40;

    }



    /* QUANTITY MATCH */

    if (
        farmerData.quantity
        >=
        requesterData.quantity
    ) {

        score += 20;

    }



    /* PRICE MATCH */

    if (
        farmerData.price
        <=
        requesterData.maxPrice
    ) {

        score += 20;

    }



    /* LOCATION MATCH */

    if (
        farmerData.location
        .toLowerCase()
        ===
        requesterData.location
        .toLowerCase()
    ) {

        score += 20;

    }



    showMatch(score);

}



/* DISPLAY MATCH */

function showMatch(score) {

    document.getElementById(
        "match"
    ).style.display = "block";


    let result =
        document.getElementById(
            "matchResult"
        );


    if (score >= 60) {

        result.innerHTML = `

            <div class="score">

                ${score}% MATCH

            </div>


            <div class="match-card">

                <h3>
                    🌱 ${farmerData.product}
                </h3>

                <p>

                    <b>Available:</b>
                    ${farmerData.quantity} kg

                </p>

                <p>

                    <b>Price:</b>
                    ₹${farmerData.price}/kg

                </p>

                <p>

                    📍 ${farmerData.location}

                </p>

                <hr><br>

                <h3>
                    🛒 Request
                </h3>

                <p>

                    <b>Requester:</b>
                    ${requesterData.name}

                </p>

                <p>

                    <b>Needs:</b>
                    ${requesterData.quantity} kg

                </p>

                <p>

                    <b>Maximum price:</b>
                    ₹${requesterData.maxPrice}/kg

                </p>

            </div>

        `;

    }

    else {

        result.innerHTML = `

            <div class="score">

                ${score}% MATCH

            </div>

            <div class="match-card">

                <h3>
                    No strong match yet.
                </h3>

                <p>

                    FarmSwap will keep looking
                    for a better combination.

                </p>

            </div>

        `;

    }


    document.getElementById(
        "match"
    ).scrollIntoView({
        behavior: "smooth"
    });

}



/* CONNECT */

function connectUsers() {

    alert(

        "🎉 Match confirmed!\n\n" +

        "FarmSwap has connected the " +

        "supplier and requester."

    );

}
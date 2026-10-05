/* =========================================================
   PARKSMART SMART PARKING SYSTEM
   COMPLETE JAVASCRIPT
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const loginFormBox =
    document.getElementById("loginFormBox");

const registerFormBox =
    document.getElementById("registerFormBox");

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");

const dashboardView =
    document.getElementById("dashboardView");

const publicView =
    document.getElementById("publicView");

const driverView =
    document.getElementById("driverView");

const bookingView =
    document.getElementById("bookingView");

const adminView =
    document.getElementById("adminView");


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

    if (registerFormBox) {
        registerFormBox.classList.remove("active");
    }

    if (loginFormBox) {
        loginFormBox.classList.add("active");
    }

}


/* =========================================================
   SHOW REGISTER
========================================================= */

function showRegister() {

    if (loginFormBox) {
        loginFormBox.classList.remove("active");
    }

    if (registerFormBox) {
        registerFormBox.classList.add("active");
    }

}


/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

function togglePassword(inputId, button) {

    const input =
        document.getElementById(inputId);

    if (!input) {
        return;
    }

    if (input.type === "password") {

        input.type = "text";

        button.textContent = "Hide";

    } else {

        input.type = "password";

        button.textContent = "Show";

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    if (!toast || !toastMessage) {
        return;
    }

    toastMessage.textContent = message;

    toast.classList.add("show");

    setTimeout(function () {

        toast.classList.remove("show");

    }, 3000);

}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;

            if (email === "") {

                showToast(
                    "Please enter your email."
                );

                return;
            }

            if (password === "") {

                showToast(
                    "Please enter your password."
                );

                return;
            }

            if (password.length < 6) {

                showToast(
                    "Password must contain at least 6 characters."
                );

                return;
            }

            const registeredEmail =
                localStorage.getItem(
                    "parkSmartEmail"
                );

            if (
                registeredEmail &&
                registeredEmail !== email
            ) {

                showToast(
                    "Please use your registered email."
                );

                return;
            }

            localStorage.setItem(
                "parkSmartLoggedIn",
                "true"
            );

            localStorage.setItem(
                "parkSmartEmail",
                email
            );

            showToast(
                "Login successful! Welcome to ParkSmart."
            );

            setTimeout(function () {

                showDashboard();

            }, 1000);

        }
    );

}


/* =========================================================
   REGISTRATION
========================================================= */

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const firstName =
                document
                    .getElementById("firstName")
                    .value
                    .trim();

            const lastName =
                document
                    .getElementById("lastName")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("registerEmail")
                    .value
                    .trim();

            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("registerPassword")
                    .value;

            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;

            const terms =
                document
                    .getElementById("terms")
                    .checked;

            if (firstName === "") {

                showToast(
                    "Enter your first name."
                );

                return;
            }

            if (lastName === "") {

                showToast(
                    "Enter your last name."
                );

                return;
            }

            if (email === "") {

                showToast(
                    "Enter your email address."
                );

                return;
            }

            if (phone === "") {

                showToast(
                    "Enter your mobile number."
                );

                return;
            }

            if (password.length < 6) {

                showToast(
                    "Password must contain at least 6 characters."
                );

                return;
            }

            if (password !== confirmPassword) {

                showToast(
                    "Passwords do not match."
                );

                return;
            }

            if (!terms) {

                showToast(
                    "Please accept the Terms & Conditions."
                );

                return;
            }

            localStorage.setItem(
                "parkSmartFirstName",
                firstName
            );

            localStorage.setItem(
                "parkSmartLastName",
                lastName
            );

            localStorage.setItem(
                "parkSmartEmail",
                email
            );

            localStorage.setItem(
                "parkSmartPhone",
                phone
            );

            showToast(
                "Account created successfully!"
            );

            setTimeout(function () {

                registerForm.reset();

                showLogin();

                const loginEmail =
                    document.getElementById(
                        "loginEmail"
                    );

                if (loginEmail) {
                    loginEmail.value = email;
                }

            }, 1300);

        }
    );

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

function forgotPassword() {

    const email =
        prompt(
            "Enter your registered email:"
        );

    if (!email) {
        return;
    }

    showToast(
        "Password reset link sent to " + email
    );

}


/* =========================================================
   GOOGLE LOGIN
========================================================= */

function googleLogin() {

    showToast(
        "Google Login demo activated."
    );

}


/* =========================================================
   MOUSE PARALLAX BACKGROUND
========================================================= */

document.addEventListener(
    "mousemove",
    function (event) {

        const x =
            (event.clientX /
                window.innerWidth -
                0.5) * 15;

        const y =
            (event.clientY /
                window.innerHeight -
                0.5) * 15;

        const background =
            document.querySelector(
                ".background"
            );

        if (background) {

            background.style.transform =
                `scale(1.07) translate(${x}px, ${y}px)`;

        }

    }
);


/* =========================================================
   HIDE ALL VIEWS
========================================================= */

function hideAllViews() {

    if (publicView) {
        publicView.classList.add("hidden");
    }

    if (driverView) {
        driverView.classList.add("hidden");
    }

    if (bookingView) {
        bookingView.classList.add("hidden");
    }

    if (adminView) {
        adminView.classList.add("hidden");
    }

    if (dashboardView) {
        dashboardView.classList.add("hidden");
    }

}


/* =========================================================
   SHOW DASHBOARD
========================================================= */

function showDashboard() {

    const authPage =
        document.getElementById("authPage");

    if (authPage) {

        authPage.style.display = "none";

    }

    if (dashboardView) {

        dashboardView.classList.remove("hidden");

        dashboardView.style.display = "block";

    }

    initializeParkingDashboard();

    displayMyBookings();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   PARKING DATA
========================================================= */

const parkingData = [

    {
        id: 1,
        name: "City Center Mall Parking",
        state: "Maharashtra",
        city: "Nashik",
        area: "Gangapur Road",
        locality: "Gangapur Road",
        lat:19.99048,
        lng:73.76162,
        available: 24,
        capacity: 50,
        rate: 20
    },

    {
        id: 2,
        name: "Phoenix Marketcity Parking",
        state: "Maharashtra",
        city: "Pune",
        area: "Viman Nagar",
        locality: "Viman Nagar",
        lat: 18.5621, 
        lng: 73.9167,
        available: 8,
        capacity: 40,
        rate: 30
    },

    {
        id: 3,
        name: "Palladium Mall Parking",
        state: "Gujarat",
        city: "Ahmedabad",
        area: "Sabarmati",
        locality: "Sarkhej-Gandhinagar Highway",
        lat:23.058328, 
        lng: 72.520689,
        available: 4,
        capacity: 35,
        rate: 35
    },

    {
        id: 4,
        name: "VR Mall Parking",
        state: "Gujarat",
        city: "Surat",
        area: "Dumas Road",
        locality: "Magdalla Road",
        lat: 21.1440,
        lng: 72.7455,
        available: 5,
        capacity: 60,
        rate: 60
    },

    {
        id: 5,
        name: "Pune Central Parking",
        state: "Maharashtra",
        city: "Pune",
        area: "Shivajinagar",
        locality: "Shivajinagar",
        lat: 18.5308,
        lng: 73.8475,
        available: 31,
        capacity: 80,
        rate: 50
    },

    {
        id: 6,
        name: "Andheri Metro Parking",
        state: "Maharashtra",
        city: "Mumbai",
        area: "Andheri",
        locality: "Andheri",
        lat: 19.1197,
        lng: 72.8468,
        available: 12,
        capacity: 100,
        rate: 80
    },

    {
        id: 7,
        name: "Bandra Parking Hub",
        state: "Maharashtra",
        city: "Mumbai",
        area: "Bandra",
        locality: "Bandra",
        lat: 19.0607,
        lng: 72.8362,
        available: 7,
        capacity: 75,
        rate: 90
    },

    {
        id: 8,
        name: "Ahmedabad City Parking",
        state: "Gujarat",
        city: "Ahmedabad",
        area: "Navrangpura",
        locality: "Navrangpura",
        lat: 23.0350,
        lng: 72.5600,
        available: 28,
        capacity: 70,
        rate: 50
    },

    // {
    //     id: 9,
    //     name: "Surat Central Parking",
    //     state: "Gujarat",
    //     city: "Surat",
    //     area: "Adajan",
    //     locality: "Adajan",
    //     lat: 21.1959,
    //     lng: 72.7933,
    //     available: 17,
    //     capacity: 60,
    //     rate: 40
    // },

    // {
    //     id: 10,
    //     name: "Indore Central Parking",
    //     state: "Madhya Pradesh",
    //     city: "Indore",
    //     area: "Vijay Nagar",
    //     locality: "Vijay Nagar",
    //     lat: 22.7533,
    //     lng: 75.8937,
    //     available: 22,
    //     capacity: 70,
    //     rate: 35
    // },

    {
        id: 11,
        name: "Connaught Place Parking",
        state: "Delhi",
        city: "New Delhi",
        area: "Connaught Place",
        locality: "Connaught Place",
        lat: 28.6315,
        lng: 77.2167,
        available: 9,
        capacity: 100,
        rate: 80
    },

    {
        id: 12,
        name: "MG Road Smart Parking",
        state: "Karnataka",
        city: "Bengaluru",
        area: "MG Road",
        locality: "MG Road",
        lat: 12.9758,
        lng: 77.6050,
        available: 18,
        capacity: 80,
        rate: 60
    }

];
/* =====================================
   PARKING SLOTS SCREEN
===================================== */

let selectedParkingForSlots = null;
let selectedParkingSlot = null;
let parkingSlots = {};

// Slots for a parking location.
// Uses the same generator as the dashboard so both always agree.
function getParkingSlots(parking) {
    return createParkingSlots(parking);
}

// Display all slots.
function renderParkingSlots() {
    const grid = document.getElementById("parkingSlotGrid");
    const availabilityText = document.getElementById("slotAvailabilityText");

    if (!grid || !selectedParkingForSlots) return;

    grid.innerHTML = "";

    const slots = getParkingSlots(selectedParkingForSlots);
    const vacantCount = slots.filter(
        slot => slot.status === "vacant"
    ).length;

    availabilityText.textContent =
        `${vacantCount} vacant out of ${slots.length} slots`;

    slots.forEach(slot => {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = slot.id;
        button.className = `parking-slot ${slot.status}`;

        if (selectedParkingSlot &&
            selectedParkingSlot.id === slot.id) {
            button.className = "parking-slot selected";
        }

        button.disabled = slot.status !== "vacant";

        button.title = slot.status === "vacant"
            ? "Click to select this slot"
            : slot.status.charAt(0).toUpperCase() + slot.status.slice(1);

        button.addEventListener("click", () => {
            selectedParkingSlot = slot;
            renderParkingSlots();
            updateSelectedSlotDisplay();
        });

        grid.appendChild(button);
    });
}

// Update selected slot and booking button.
function updateSelectedSlotDisplay() {
    const selectedName = document.getElementById("selectedSlotName");
    const bookButton = document.getElementById("bookSelectedSlot");

    selectedName.textContent = selectedParkingSlot
        ? selectedSlotParkingName()
        : "None";

    bookButton.disabled = !selectedParkingSlot;
}

function selectedSlotParkingName() {
    return selectedParkingSlot ? selectedParkingSlot.id : "None";
}

// Show the dashboard again (and fix the Leaflet map size,
// because it was hidden while the slots screen was open).
function showDashboardSection() {

    const dashboardSection =
        document.getElementById("dashboardSection");

    const parkingSlotsPage =
        document.getElementById("parkingSlotsPage");

    if (parkingSlotsPage) {
        parkingSlotsPage.hidden = true;
    }

    if (dashboardSection) {
        dashboardSection.hidden = false;
    }

    if (parkingMap) {
        setTimeout(function () {
            parkingMap.invalidateSize();
        }, 0);
    }

}

// Back to dashboard.
const backToDashboardButton =
    document.getElementById("backToDashboard");

if (backToDashboardButton) {

    backToDashboardButton.addEventListener("click", () => {

        showDashboardSection();

        selectedParkingForSlots = null;
        selectedParkingSlot = null;

        window.scrollTo({ top: 0, behavior: "smooth" });

    });

}

// NOTE: "Book Selected Slot" is handled once, further below,
// by bookSelectedParkingSlot().


/* =========================================================
   MAP VARIABLES
========================================================= */

let parkingMap = null;

let parkingMarkers = [];

let currentLocationMarker = null;

let selectedParking = null;


/* =========================================================
   SLOT VARIABLES
========================================================= */

/*
   parkingSlots stores the slot information
   for every parking location.

   Example:

   parkingSlots[1] = [
       { id: "A1", status: "vacant" },
       { id: "A2", status: "occupied" },
       { id: "A3", status: "reserved" }
   ];
*/

let selectedSlot = null;

let selectedSlotParking = null;


/* =========================================================
   LOCAL STORAGE BOOKING KEY
========================================================= */

const BOOKING_STORAGE_KEY =
    "parkSmartBookings";


/* =========================================================
   INITIALIZE PARKING DASHBOARD
========================================================= */

function clearParkingResultsUntilLocationSelected() {

    const parkingList = document.getElementById("parkingList");
    if (parkingList) {
        parkingList.innerHTML = `
            <div class="no-parking parking-location-prompt">
                <h3>📍 Select a location to find parking</h3>
                <p>Use <strong>Current Location</strong> or search for an area, city or locality.</p>
            </div>
        `;
    }

    updateParkingCount(0);

    if (typeof updateDashboardMap === "function") {
        updateDashboardMap([]);
    }
}


function initializeParkingDashboard() {

    const mapElement =
        document.getElementById("parkingMap");

    if (!mapElement) {
        return;
    }

    if (parkingMap) {
        return;
    }

    parkingMap =
        L.map("parkingMap").setView(
            [22.9734, 78.6569],
            5
        );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(parkingMap);

    // Keep the dashboard empty until the user selects a location.
    clearParkingResultsUntilLocationSelected();

    displayMyBookings();

}


/* =========================================================
   PARKING STATUS
========================================================= */

function getParkingStatus(parking) {

    const percentage =
        (parking.available /
            parking.capacity) * 100;

    if (parking.available === 0) {
        return "full";
    }

    if (percentage <= 20) {
        return "limited";
    }

    return "available";

}


/* =========================================================
   CREATE PARKING SLOTS
========================================================= */

function createParkingSlots(parking) {

    if (parkingSlots[parking.id]) {
        return parkingSlots[parking.id];
    }

    const slots = [];

    /*
       We create slots row-wise.

       Example:

       A1 A2 A3 A4 A5
       B1 B2 B3 B4 B5
       C1 C2 C3 C4 C5
    */

    const columns = 5;

    for (
        let i = 1;
        i <= parking.capacity;
        i++
    ) {

        const rowNumber =
            Math.floor(
                (i - 1) / columns
            );

        const rowLetter =
            String.fromCharCode(
                65 + rowNumber
            );

        const columnNumber =
            ((i - 1) % columns) + 1;

        const slotId =
            rowLetter + columnNumber;

        /*
           Initial slot status.

           We make exactly parking.available
           slots vacant.

           The remaining slots are occupied.

           Some occupied slots are shown as
           reserved for demonstration.
        */

        let status = "occupied";

        if (i <= parking.available) {

            status = "vacant";

        }

        /*
           Demo reserved slots.

           Only slots that are not vacant
           are converted to reserved.
        */

        if (
            status === "occupied" &&
            i % 11 === 0
        ) {

            status = "reserved";

        }

        slots.push({
            id: slotId,
            status: status
        });

    }

    /*
       Apply existing localStorage bookings.
    */

    const bookings =
        getBookings();

    bookings.forEach(
        booking => {

            if (
                Number(booking.parkingId) ===
                Number(parking.id)
            ) {

                const slot =
                    slots.find(
                        item =>
                            item.id ===
                            booking.slotId
                    );

                if (slot) {

                    /*
                       A saved booking took a vacant slot,
                       so the available count must go down too.
                       (parkingData resets on every page load.)
                    */

                    if (
                        slot.status === "vacant" &&
                        parking.available > 0
                    ) {

                        parking.available--;

                    }

                    slot.status =
                        "reserved";

                }

            }

        }
    );

    parkingSlots[parking.id] =
        slots;

    return slots;

}


/* =========================================================
   GET BOOKINGS FROM LOCAL STORAGE
========================================================= */

function getBookings() {

    try {

        const storedBookings =
            localStorage.getItem(
                BOOKING_STORAGE_KEY
            );

        if (!storedBookings) {
            return [];
        }

        const parsedBookings =
            JSON.parse(
                storedBookings
            );

        if (Array.isArray(parsedBookings)) {
            return parsedBookings;
        }

        return [];

    } catch (error) {

        console.error(
            "Unable to read bookings:",
            error
        );

        return [];

    }

}


/* =========================================================
   SAVE BOOKINGS
========================================================= */

function saveBookings(bookings) {

    localStorage.setItem(
        BOOKING_STORAGE_KEY,
        JSON.stringify(bookings)
    );

}


/* =========================================================
   DISPLAY PARKING LIST
========================================================= */

function displayDashboardParking(data) {

    const parkingList =
        document.getElementById(
            "parkingList"
        );

    if (!parkingList) {
        return;
    }

    parkingList.innerHTML = "";

    if (!data || data.length === 0) {

        parkingList.innerHTML = `
            <div class="no-parking">

                <h3>
                    No parking found
                </h3>

                <p>
                    Try another city, area,
                    place or colony.
                </p>

            </div>
        `;

        updateDashboardMap([]);

        updateParkingCount(0);

        return;

    }


    data.forEach(
        parking => {

            const status =
                getParkingStatus(
                    parking
                );

            const statusText =
                status === "available"
                    ? "Available"
                    : status === "limited"
                        ? "Limited"
                        : "Full";


            /*
               Make sure slots exist.
            */

            createParkingSlots(
                parking
            );


            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "parking-result";


            /*
               PRICE REMOVED FROM CARD
               according to your requirement.
            */

            card.innerHTML = `

                <div class="parking-result-top">

                    <div>

                        <strong>
                            ${parking.name}
                        </strong>

                        <small>
                            📍 ${parking.area},
                            ${parking.city}
                        </small>

                    </div>

                    <span
                        class="parking-status ${status}">

                        ${statusText}

                    </span>

                </div>


                <div class="parking-result-bottom">

                    <span class="spaces">

                        🅿️
                        ${parking.available}
                        /
                        ${parking.capacity}
                        spaces available

                    </span>

                </div>


                <button
                    class="parking-book-btn"
                    type="button"
                    onclick="openParkingSlots(${parking.id})">

                    View Slots

                </button>

            `;


            parkingList.appendChild(
                card
            );

        }
    );


    updateParkingCount(
        data.length
    );

    updateDashboardMap(
        data
    );

}


/* =========================================================
   UPDATE PARKING COUNT
========================================================= */

function updateParkingCount(count) {

    const parkingCount =
        document.getElementById(
            "parkingCount"
        );

    if (parkingCount) {

        parkingCount.textContent =
            `${count} locations`;

    }

}


/* =========================================================
   UPDATE MAP
========================================================= */

function updateDashboardMap(data) {

    if (!parkingMap) {
        return;
    }


    /*
       Remove old parking markers.
    */

    parkingMarkers.forEach(
        marker => {

            parkingMap.removeLayer(
                marker
            );

        }
    );

    parkingMarkers = [];


    /*
       Create new markers.
    */

    data.forEach(
        parking => {

            const status =
                getParkingStatus(
                    parking
                );


            let color =
                status === "available"
                    ? "#22c55e"
                    : status === "limited"
                        ? "#f59e0b"
                        : "#ef4444";


            const markerIcon =
                L.divIcon({

                    className: "",

                    html: `
                        <div style="
                            width:18px;
                            height:18px;
                            border-radius:50%;
                            background:${color};
                            border:3px solid white;
                            box-shadow:0 3px 12px rgba(0,0,0,.5);
                        "></div>
                    `,

                    iconSize: [
                        18,
                        18
                    ],

                    iconAnchor: [
                        9,
                        9
                    ]

                });


            const marker =
                L.marker(
                    [
                        parking.lat,
                        parking.lng
                    ],
                    {
                        icon: markerIcon
                    }
                ).addTo(
                    parkingMap
                );


            /*
               Map popup now opens
               the slot system.
            */

            marker.bindPopup(`

                <div>

                    <strong>
                        ${parking.name}
                    </strong>

                    <br>

                    📍
                    ${parking.area},
                    ${parking.city}

                    <br><br>

                    🅿️
                    ${parking.available}
                    spaces available

                    <br><br>

                    <button
                            class="view-slots-btn"
                            onclick="openParkingSlots('${parking.id}')"
                            type="button">
                            View Slots
</button>

                </div>

            `);


            parkingMarkers.push(
                marker
            );

        }
    );

}


/* =========================================================
   SEARCH ELEMENTS
========================================================= */

const parkingSearch =
    document.getElementById(
        "parkingSearch"
    );

const searchLocationBtn =
    document.getElementById(
        "searchLocationBtn"
    );

const clearSearch =
    document.getElementById(
        "clearSearch"
    );

const searchResults =
    document.getElementById(
        "searchResults"
    );

/*
   .location-search-results is display:none until it has ".show".
   Show it whenever it contains a message, hide it when empty.
*/

if (searchResults) {

    new MutationObserver(function () {

        searchResults.classList.toggle(
            "show",
            searchResults.textContent.trim() !== ""
        );

    }).observe(searchResults, {
        childList: true,
        characterData: true,
        subtree: true
    });

}


/* =========================================================
   SEARCH PARKING
========================================================= */

function performParkingSearch() {

    const searchText =
        parkingSearch
            ? parkingSearch.value
                .trim()
                .toLowerCase()
            : "";


    /*
       EMPTY SEARCH
    */

    if (searchText === "") {

        clearParkingResultsUntilLocationSelected();


        const selectedLocationText =
            document.getElementById(
                "selectedLocationText"
            );

        const parkingHeading =
            document.getElementById(
                "parkingHeading"
            );


        if (selectedLocationText) {

            selectedLocationText.textContent =
                "Showing parking across India";

        }


        if (parkingHeading) {

            parkingHeading.textContent =
                "Parking near you";

        }


        if (searchResults) {

            searchResults.innerHTML = "";

        }


        if (parkingMap) {

            parkingMap.setView(
                [
                    22.9734,
                    78.6569
                ],
                5
            );

        }

        return;

    }


    /*
       SEARCH NAME, AREA,
       LOCALITY, CITY AND STATE
    */

    const results =
        parkingData.filter(
            parking => {

                const searchableText = [

                    parking.name,

                    parking.area,

                    parking.locality,

                    parking.city,

                    parking.state

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return searchableText.includes(
                    searchText
                );

            }
        );


    displayDashboardParking(
        results
    );


    /*
       RESULTS FOUND
    */

    if (results.length > 0) {

        const firstResult =
            results[0];


        const selectedLocationText =
            document.getElementById(
                "selectedLocationText"
            );

        const parkingHeading =
            document.getElementById(
                "parkingHeading"
            );


        if (selectedLocationText) {

            selectedLocationText.textContent =
                `${firstResult.area}, ${firstResult.city}`;

        }


        if (parkingHeading) {

            parkingHeading.textContent =
                `Parking near ${firstResult.area}`;

        }


        if (searchResults) {

            searchResults.innerHTML = `

                <div class="search-result-message">

                    ${results.length}
                    parking location(s) found

                </div>

            `;

        }


        if (parkingMap) {

            parkingMap.setView(
                [
                    firstResult.lat,
                    firstResult.lng
                ],
                15
            );

        }

    }


    /*
       NO RESULTS
    */

    else {

        const selectedLocationText =
            document.getElementById(
                "selectedLocationText"
            );

        const parkingHeading =
            document.getElementById(
                "parkingHeading"
            );


        if (selectedLocationText) {

            selectedLocationText.textContent =
                "No parking location found";

        }


        if (parkingHeading) {

            parkingHeading.textContent =
                "No Results";

        }


        if (searchResults) {

            searchResults.innerHTML = `

                <div class="search-result-message">

                    No parking found for
                    "${parkingSearch.value.trim()}"

                </div>

            `;

        }

    }

}


/* =========================================================
   SEARCH WHILE TYPING
========================================================= */

if (parkingSearch) {

    parkingSearch.addEventListener(
        "input",
        function () {

            const value =
                this.value.trim();

            if (value === "") {

                performParkingSearch();

                return;

            }

            if (value.length >= 2) {

                performParkingSearch();

            }

        }
    );


    /*
       ENTER KEY
    */

    parkingSearch.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                performParkingSearch();

            }

        }
    );

}


/* =========================================================
   SEARCH BUTTON
========================================================= */

if (searchLocationBtn) {

    searchLocationBtn.addEventListener(
        "click",
        function () {

            performParkingSearch();

        }
    );

}


/* =========================================================
   CLEAR SEARCH
========================================================= */

if (clearSearch) {

    clearSearch.addEventListener(
        "click",
        function () {

            if (parkingSearch) {

                parkingSearch.value = "";

            }

            performParkingSearch();

            if (searchResults) {

                searchResults.innerHTML = "";

            }

        }
    );

}


/* =========================================================
   CURRENT LOCATION
========================================================= */

const currentLocationBtn =
    document.getElementById(
        "currentLocationBtn"
    );


if (currentLocationBtn) {

    currentLocationBtn.addEventListener(
        "click",
        function () {

            if (!navigator.geolocation) {

                showToast(
                    "Geolocation is not supported by your browser."
                );

                return;

            }


            if (!parkingMap) {

                initializeParkingDashboard();

            }


            currentLocationBtn.disabled =
                true;

            currentLocationBtn.textContent =
                "📍 Getting Location...";


            navigator.geolocation.getCurrentPosition(

                function (position) {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    console.log(
                        "Current Latitude:",
                        latitude
                    );

                    console.log(
                        "Current Longitude:",
                        longitude
                    );


                    /*
                       REMOVE OLD LOCATION MARKER
                    */

                    if (currentLocationMarker) {

                        parkingMap.removeLayer(
                            currentLocationMarker
                        );

                    }


                    /*
                       CREATE LOCATION MARKER
                    */

                    currentLocationMarker =
                        L.marker(
                            [
                                latitude,
                                longitude
                            ]
                        ).addTo(
                            parkingMap
                        );


                    currentLocationMarker
                        .bindPopup(`
                            <strong>
                                📍 You are here
                            </strong>
                            <br>
                            Current Location
                        `)
                        .openPopup();


                    /*
                       MOVE MAP
                    */

                    parkingMap.setView(
                        [
                            latitude,
                            longitude
                        ],
                        15
                    );


                    /*
                       UPDATE TEXT
                    */

                    const selectedLocationText =
                        document.getElementById(
                            "selectedLocationText"
                        );

                    const parkingHeading =
                        document.getElementById(
                            "parkingHeading"
                        );


                    if (selectedLocationText) {

                        selectedLocationText.textContent =
                            "📍 Your current location";

                    }


                    if (parkingHeading) {

                        parkingHeading.textContent =
                            "Parking near your location";

                    }


                    /*
                       CLEAR SEARCH
                    */

                    if (parkingSearch) {

                        parkingSearch.value = "";

                    }


                    if (searchResults) {

                        searchResults.innerHTML = "";

                    }


                    /*
                       SHOW ONLY PARKING NEAR THE CURRENT LOCATION.
                       Do not show unrelated parking from other cities.
                    */
                    const nearbyParking = parkingData
                        .map(parking => ({
                            parking,
                            distance: distanceKm(
                                latitude,
                                longitude,
                                parking.lat,
                                parking.lng
                            )
                        }))
                        .filter(item => item.distance <= 15)
                        .sort((a, b) => a.distance - b.distance)
                        .map(item => item.parking);

                    displayDashboardParking(nearbyParking);

                    if (searchResults && nearbyParking.length === 0) {
                        searchResults.innerHTML = `
                            <div class="search-result-message">
                                No parking found within 15 km of your current location.
                            </div>
                        `;
                    } else if (searchResults) {
                        searchResults.innerHTML = `
                            <div class="search-result-message">
                                ${nearbyParking.length} parking location(s) found near you.
                            </div>
                        `;
                    }


                    currentLocationBtn.disabled =
                        false;

                    currentLocationBtn.textContent =
                        "📍 Use My Current Location";


                    showToast(
                        "Your current location has been found."
                    );

                },


                /*
                   LOCATION ERROR
                */

                function (error) {

                    currentLocationBtn.disabled =
                        false;

                    currentLocationBtn.textContent =
                        "📍 Use My Current Location";


                    if (
                        error.code ===
                        error.PERMISSION_DENIED
                    ) {

                        showToast(
                            "Location permission denied. Please allow location access."
                        );

                    }

                    else if (
                        error.code ===
                        error.POSITION_UNAVAILABLE
                    ) {

                        showToast(
                            "Location unavailable. Turn ON Windows Location and try again."
                        );

                    }

                    else if (
                        error.code ===
                        error.TIMEOUT
                    ) {

                        showToast(
                            "Location request timed out. Please try again."
                        );

                    }

                    else {

                        showToast(
                            "Unable to get your current location."
                        );

                    }

                },


                /*
                   GPS OPTIONS

                   Desktop-friendly settings.
                */

                {
                    enableHighAccuracy: false,
                    timeout: 30000,
                    maximumAge: 60000
                }

            );

        }
    );

}


/* =========================================================
   OPEN PARKING SLOTS
========================================================= */

function openParkingSlots(parkingId) {

    const parking = parkingData.find(
        item => Number(item.id) === Number(parkingId)
    );

    if (!parking) {
        showToast("Parking location not found.");
        return;
    }

    // Set the selected parking location
    selectedParkingForSlots = parking;
    selectedParkingSlot = null;

    // Show the separate slots page
    const dashboardSection =
        document.getElementById("dashboardSection");

    const parkingSlotsPage =
        document.getElementById("parkingSlotsPage");

    if (dashboardSection) {
        dashboardSection.hidden = true;
    }

    if (parkingSlotsPage) {
        parkingSlotsPage.hidden = false;
    }

    // Display parking details
    const slotParkingName =
        document.getElementById("slotParkingName");

    const slotParkingLocation =
        document.getElementById("slotParkingLocation");

    if (slotParkingName) {
        slotParkingName.textContent = parking.name;
    }

    if (slotParkingLocation) {
        slotParkingLocation.textContent =
            `📍 ${parking.area}, ${parking.city}`;
    }

    // Display the slots
    renderParkingSlots();
    updateSelectedSlotDisplay();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

    /*
       DISPLAY INLINE SLOT SECTION
    */

    // const parkingSlotSection =
    //     document.getElementById(
    //         "parkingSlotSection"
    //     );


    // if (parkingSlotSection) {

    //     parkingSlotSection.classList.remove(
    //         "hidden"
    //     );

    //     parkingSlotSection.style.display =
    //         "block";

    // }


    /*
       DISPLAY SLOTS IN INLINE SECTION
    */

    // displayParkingSlots(
    //     parking
    // );


    /*
       OPEN MODAL ALSO
       This gives the user a clear
       slot-selection popup.
    */

    // const slotModal =
    //     document.getElementById(
    //         "slotModal"
    //     );


    // if (slotModalElement) {

    //     slotModal.classList.remove(
    //         "hidden"
    //     );

    //     slotModal.classList.add(
    //         "show"
    //     );

    //     slotModalElement.style.display =
    //         "flex";

    // }


    // const slotParkingName =
    //     document.getElementById(
    //         "slotParkingName"
    //     );

    // const slotParkingLocation =
    //     document.getElementById(
    //         "slotParkingLocation"
    //     );


    // if (slotParkingName) {

    //     slotParkingName.textContent =
    //         parking.name;

    // }


    // if (slotParkingLocation) {

    //     slotParkingLocation.textContent =
    //         `📍 ${parking.area}, ${parking.city}`;

    // }


    /*
       Display slots inside modal.
    */

    // displayModalParkingSlots(
    //     parking,
    //     slots
    // );


    /*
       Scroll to slot section.
    */

//     setTimeout(function () {

//         if (parkingSlotSection) {

//             parkingSlotSection.scrollIntoView({
//                 behavior: "smooth",
//                 block: "start"
//             });

//         }

//     }, 100);

// }


/* =========================================================
   DISPLAY INLINE PARKING SLOTS
========================================================= */

function displayParkingSlots(parking) {

    const grid =
        document.getElementById(
            "parkingSlotGrid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    const slots =
        createParkingSlots(
            parking
        );


    slots.forEach(
        slot => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "parking-slot-button " +
                `dashboard-slot ${slot.status}`;


            button.textContent =
                slot.id;


            /*
               Add title.
            */

            if (slot.status === "vacant") {

                button.title =
                    "Vacant - Click to select";

            }

            else if (
                slot.status === "occupied"
            ) {

                button.title =
                    "Occupied";

                button.disabled =
                    true;

            }

            else if (
                slot.status === "reserved"
            ) {

                button.title =
                    "Reserved";

                button.disabled =
                    true;

            }


            /*
               SELECT SLOT
            */

            if (slot.status === "vacant") {

                button.addEventListener(
                    "click",
                    function () {

                        selectParkingSlot(
                            parking,
                            slot
                        );

                    }
                );

            }


            grid.appendChild(
                button
            );

        }
    );


    updateSelectedSlotUI();

}


/* =========================================================
   DISPLAY MODAL PARKING SLOTS
========================================================= */

function displayModalParkingSlots(
    parking,
    slots
) {

    const grid =
        document.getElementById(
            "modalSlotGrid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    slots.forEach(
        slot => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "parking-slot-button " +
                `dashboard-slot ${slot.status}`;


            button.textContent =
                slot.id;


            if (slot.status === "vacant") {

                button.title =
                    "Vacant - Click to select";

            }


            if (
                slot.status === "occupied" ||
                slot.status === "reserved"
            ) {

                button.disabled =
                    true;

            }


            if (slot.status === "vacant") {

                button.addEventListener(
                    "click",
                    function () {

                        selectParkingSlot(
                            parking,
                            slot
                        );

                    }
                );

            }


            grid.appendChild(
                button
            );

        }
    );


    updateSelectedSlotUI();

}


/* =========================================================
   SELECT PARKING SLOT
========================================================= */

function selectParkingSlot(
    parking,
    slot
) {

    /*
       Safety check.
    */

    if (
        !parking ||
        !slot ||
        slot.status !== "vacant"
    ) {

        return;

    }


    selectedParking =
        parking;

    selectedSlotParking =
        parking;

    selectedSlot =
        slot;


    updateSelectedSlotUI();


    /*
       Highlight the slot
       in both grids.
    */

    refreshSlotDisplays();


    showToast(
        `Slot ${slot.id} selected.`
    );

}


/* =========================================================
   REFRESH BOTH SLOT DISPLAYS
========================================================= */

function refreshSlotDisplays() {

    if (!selectedParking) {
        return;
    }


    const parking =
        selectedParking;


    displayParkingSlots(
        parking
    );


    const slots =
        createParkingSlots(
            parking
        );


    displayModalParkingSlots(
        parking,
        slots
    );


    /*
       Re-apply selected style.
    */

    if (selectedSlot) {

        document
            .querySelectorAll(
                ".dashboard-slot"
            )
            .forEach(
                element => {

                    if (
                        element.textContent.trim() ===
                        selectedSlot.id
                    ) {

                        element.classList.add(
                            "selected"
                        );

                        element.classList.remove(
                            "vacant"
                        );

                    }

                }
            );

    }

}


/* =========================================================
   UPDATE SELECTED SLOT UI
========================================================= */

function updateSelectedSlotUI() {

    const selectedSlotName =
        document.getElementById(
            "selectedSlotName"
        );

    const modalSelectedSlot =
        document.getElementById(
            "modalSelectedSlot"
        );

    const bookSelectedSlot =
        document.getElementById(
            "bookSelectedSlot"
        );

    const modalBookSlot =
        document.getElementById(
            "modalBookSlot"
        );


    const slotText =
        selectedSlot
            ? selectedSlot.id
            : "None";


    if (selectedSlotName) {

        selectedSlotName.textContent =
            slotText;

    }


    if (modalSelectedSlot) {

        modalSelectedSlot.textContent =
            slotText;

    }


    const hasSelection =
        Boolean(
            selectedSlot &&
            selectedSlotParking
        );


    if (bookSelectedSlot) {

        bookSelectedSlot.disabled =
            !hasSelection;

    }


    if (modalBookSlot) {

        modalBookSlot.disabled =
            !hasSelection;

    }

}


/* =========================================================
   BOOK SELECTED SLOT
========================================================= */

function bookSelectedParkingSlot() {

    if (!selectedParkingSlot || !selectedParkingForSlots) {
        showToast("Please select a vacant parking slot first.");
        return;
    }

    const parking = selectedParkingForSlots;
    const slots = createParkingSlots(parking);
    const slot = slots.find(item => item.id === selectedParkingSlot.id);

    if (!slot || slot.status !== "vacant") {
        showToast("This slot is no longer available.");
        selectedParkingSlot = null;
        renderParkingSlots();
        updateSelectedSlotDisplay();
        return;
    }

    const amount = Number(parking.rate) || 0;
    const slotId = slot.id;

    openBookingDetailsModal(parking, slotId, amount);
}


/* =========================================================
   BOOKING DETAILS + PAYMENT
========================================================= */

function openBookingDetailsModal(parking, slotId, amount) {

    const modal = document.getElementById("demoModal");

    if (!modal) {
        showToast("Booking details screen is unavailable.");
        return;
    }

    const box = modal.querySelector(".success-box");
    const startTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    box.innerHTML = `
        <div class="parksmart-booking-form">
            <div class="parksmart-step-head">
                <span class="parksmart-step-badge">1</span>
                <div>
                    <h2>🅿️ Booking Details</h2>
                    <p>Check your parking details before continuing to payment.</p>
                </div>
            </div>

            <div class="parksmart-location-card">
                <div class="parksmart-location-icon">📍</div>
                <div>
                    <strong>${escHtml(parking.name)}</strong>
                    <span>${escHtml(parking.area || "Parking Area")}, ${escHtml(parking.city || "")}</span>
                </div>
            </div>

            <div class="parksmart-slot-banner">
                <span>Selected Parking Slot</span>
                <strong>${escHtml(slotId)}</strong>
            </div>

            <div class="parksmart-form-grid">
                <div class="parksmart-form-field">
                    <label for="bookingVehicleType">Vehicle Type</label>
                    <select id="bookingVehicleType" class="pay-input">
                        <option value="Car">🚗 Car</option>
                        <option value="SUV">🚙 SUV</option>
                        <option value="Bike">🏍️ Bike</option>
                        <option value="EV">⚡ EV</option>
                    </select>
                </div>

                <div class="parksmart-form-field">
                    <label for="bookingCarType">Car Type / Model</label>
                    <input id="bookingCarType" class="pay-input"
                           placeholder="e.g. Swift, Creta, Nexon">
                </div>

                <div class="parksmart-form-field full-width">
                    <label for="bookingCarNumber">Car Number</label>
                    <input id="bookingCarNumber" class="pay-input"
                           placeholder="e.g. MH 15 AB 1234"
                           maxlength="15">
                </div>

                <div class="parksmart-form-field full-width">
                    <label for="bookingDuration">Time Duration</label>
                    <select id="bookingDuration" class="pay-input">
                        <option value="1">1 Hour</option>
                        <option value="2">2 Hours</option>
                        <option value="3">3 Hours</option>
                        <option value="4">4 Hours</option>
                    </select>
                </div>
            </div>

            <div class="parksmart-confirmation-card">
                <div class="parksmart-confirmation-row">
                    <span>Parking Slot</span>
                    <strong>${escHtml(slotId)}</strong>
                </div>
                <div class="parksmart-confirmation-row">
                    <span>Start Time</span>
                    <strong>${startTime}</strong>
                </div>
                <div class="parksmart-confirmation-row total-row">
                    <span>Total Amount</span>
                    <strong id="bookingTotalAmount">₹${amount}</strong>
                </div>
            </div>

            <div class="parksmart-next-note">
                🔒 Your details will be saved before you continue to the payment screen.
            </div>

            <button type="button" id="saveBookingDetails" class="confirm-booking">
                Save & Continue to Payment →
            </button>
            <button type="button" id="cancelBookingDetails" class="pay-ghost">
                Cancel
            </button>
        </div>
    `;

    modal.classList.add("show");
    modal.style.display = "flex";

    const duration = document.getElementById("bookingDuration");
    const total = document.getElementById("bookingTotalAmount");

    if (duration && total) {
        duration.addEventListener("change", function () {
            total.textContent = `₹${amount * Number(duration.value)}`;
        });
    }

    document.getElementById("cancelBookingDetails").onclick = closeModal;

    document.getElementById("saveBookingDetails").onclick = function () {

        const vehicleType =
            document.getElementById("bookingVehicleType").value;

        const carType =
            document.getElementById("bookingCarType").value.trim();

        const carNumber =
            document.getElementById("bookingCarNumber").value.trim().toUpperCase();

        const hours =
            Number(document.getElementById("bookingDuration").value) || 1;

        if (!carType) {
            showToast("Please enter the car type/model.");
            document.getElementById("bookingCarType").focus();
            return;
        }

        if (!carNumber) {
            showToast("Please enter the car number.");
            document.getElementById("bookingCarNumber").focus();
            return;
        }

        const totalAmount = amount * hours;

        closeModal();

        // Payment opens ONLY after the booking details are saved.
        openParkSmartPaymentModal(
            totalAmount,
            {
                vehicleType,
                carType,
                carNumber,
                hours,
                startTime: new Date().toLocaleString(),
                parkingName: parking.name,
                parkingId: parking.id,
                parkingArea: parking.area,
                parkingCity: parking.city,
                slotId
            }
        );
    };
}


/* =========================================================
   PARKSMART PAYMENT MODAL
========================================================= */

function openParkSmartPaymentModal(amount, details) {

    const modal = document.getElementById("demoModal");

    if (!modal) {
        completeBookingAfterPayment(details, {
            method: "Cash",
            txnId: "PS" + Date.now(),
            paidAt: Date.now()
        });
        return;
    }

    const box = modal.querySelector(".success-box");

    box.innerHTML = `
        <div class="parksmart-payment-form">
            <h2>💳 ParkSmart Payment</h2>
            <p>${escHtml(details.parkingName)} • Slot ${escHtml(details.slotId)}</p>

            <div class="parksmart-payment-amount">
                Total Payable: <strong>₹${amount}</strong>
            </div>

            <div class="parksmart-payment-methods">
                <button type="button" data-ps-method="UPI" class="selected">📱 UPI</button>
                <button type="button" data-ps-method="Card">💳 Card</button>
                <button type="button" data-ps-method="Net Banking">🏦 Net Banking</button>
                <button type="button" data-ps-method="Cash">💵 Cash</button>
                <button type="button" data-ps-method="QR Code">▣ QR Code</button>
            </div>

            <div id="parksmartPaymentFields"></div>

            <p id="parksmartPaymentError" class="log-warn"></p>

            <button type="button" id="parksmartPayNow"
                    class="confirm-booking">
                Pay ₹${amount}
            </button>

            <button type="button" id="parksmartPaymentCancel"
                    class="pay-ghost">
                Cancel
            </button>
        </div>
    `;

    modal.classList.add("show");
    modal.style.display = "flex";

    let selectedMethod = "UPI";

    const fields = document.getElementById("parksmartPaymentFields");
    const error = document.getElementById("parksmartPaymentError");

    function renderPaymentFields() {

        if (selectedMethod === "UPI") {
            fields.innerHTML = `
                <input id="psUpi" class="pay-input"
                       placeholder="Enter UPI ID (example@upi)">
            `;
        } else if (selectedMethod === "Card") {
            fields.innerHTML = `
                <input id="psCard" class="pay-input"
                       maxlength="19"
                       placeholder="Card number">
                <div class="pay-row">
                    <input id="psExpiry" class="pay-input"
                           maxlength="5" placeholder="MM/YY">
                    <input id="psCvv" class="pay-input"
                           maxlength="3" placeholder="CVV">
                </div>
            `;
        } else if (selectedMethod === "Net Banking") {
            fields.innerHTML = `
                <select id="psBank" class="pay-input">
                    <option value="">Select Bank</option>
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                </select>
            `;
        } else if (selectedMethod === "QR Code") {
            fields.innerHTML = `
                <div class="parksmart-qr-box">
                    <div class="parksmart-qr">▦</div>
                    <strong>Scan to Pay</strong>
                    <small>ParkSmart Demo QR</small>
                </div>
            `;
        } else {
            fields.innerHTML = `
                <p class="pay-demo-note">
                    Cash payment will be recorded for this demo booking.
                </p>
            `;
        }
    }

    renderPaymentFields();

    modal.querySelectorAll("[data-ps-method]").forEach(button => {
        button.onclick = function () {

            selectedMethod = this.dataset.psMethod;

            modal.querySelectorAll("[data-ps-method]")
                .forEach(item => item.classList.remove("selected"));

            this.classList.add("selected");

            error.textContent = "";
            renderPaymentFields();
        };
    });

    document.getElementById("parksmartPaymentCancel").onclick = closeModal;

    document.getElementById("parksmartPayNow").onclick = function () {

        let valid = true;

        if (selectedMethod === "UPI") {
            const value = document.getElementById("psUpi").value.trim();
            valid = /^[\w.\-]+@[\w]+$/.test(value);
        }

        if (selectedMethod === "Card") {
            const card = document.getElementById("psCard").value.replace(/\s/g, "");
            const expiry = document.getElementById("psExpiry").value.trim();
            const cvv = document.getElementById("psCvv").value.trim();

            valid =
                /^\d{16}$/.test(card) &&
                /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) &&
                /^\d{3}$/.test(cvv);
        }

        if (selectedMethod === "Net Banking") {
            valid = Boolean(document.getElementById("psBank").value);
        }

        if (!valid) {
            error.textContent = "Please enter valid payment details.";
            return;
        }

        this.disabled = true;
        this.textContent = "Processing...";

        setTimeout(function () {

            const info = {
                method: selectedMethod,
                txnId: "PS" + Date.now() +
                    Math.floor(Math.random() * 1000),
                paidAt: Date.now()
            };

            closeModal();

            completeBookingAfterPayment(
                details,
                info,
                amount
            );

        }, 800);
    };
}


/* =========================================================
   COMPLETE BOOKING AFTER PAYMENT
========================================================= */

function completeBookingAfterPayment(details, payment, amountOverride) {

    const parking = parkingData.find(
        item => Number(item.id) === Number(details.parkingId)
    ) || selectedParkingForSlots;

    if (!parking) {
        showToast("Parking location could not be found.");
        return;
    }

    const slots = createParkingSlots(parking);

    const slot = slots.find(
        item => item.id === details.slotId
    );

    if (!slot || slot.status !== "vacant") {
        showToast("This slot is no longer available.");
        selectedParkingSlot = null;
        renderParkingSlots();
        updateSelectedSlotDisplay();
        return;
    }

    slot.status = "reserved";

    if (parking.available > 0) {
        parking.available--;
    }

    const amount =
        Number(amountOverride) ||
        Number(parking.rate) * Number(details.hours || 1);

    const bookingId =
        "PS" + Math.floor(100000 + Math.random() * 900000);

    const booking = {
        id: bookingId,
        parkingId: parking.id,
        parkingName: parking.name,
        parkingArea: parking.area,
        parkingCity: parking.city,
        slotId: slot.id,
        status: "Reserved",
        createdAt: new Date().toLocaleString(),

        vehicleType: details.vehicleType || "Car",
        carType: details.carType || "Car",
        carNumber: details.carNumber || "",
        hours: Number(details.hours) || 1,
        startTime: details.startTime || new Date().toLocaleString(),

        payment: {
            amount: amount,
            method: payment.method,
            txnId: payment.txnId,
            paidAt: payment.paidAt,
            status: "Paid"
        }
    };

    const bookings = getBookings();
    bookings.push(booking);
    saveBookings(bookings);

    selectedParkingSlot = null;
    selectedParkingForSlots = null;

    updateSelectedSlotDisplay();
    showDashboardSection();

    displayDashboardParking(
        getCurrentlyDisplayedParking()
    );

    displayMyBookings();

    const bookingIdElement =
        document.getElementById("bookingId");

    if (bookingIdElement) {
        bookingIdElement.textContent = bookingId;
    }

    // Payment is now complete. Close every payment/booking overlay so
    // the process stops here and the user is not left with an active form.
    closeModal();

    const successModal = document.getElementById("successModal");
    if (successModal) {
        successModal.classList.remove("show");
        successModal.style.display = "none";
    }

    // Refresh the Payments section so the parking receipt is available there.
    renderPayments();

    addNotification(
        `Payment successful: ₹${amount} via ${payment.method}. Slot ${slot.id} reserved.`
    );

    // Keep the receipt inside Payment Details. Do not open a separate receipt modal.

    showToast(
        `Parking booked successfully. Payment ₹${amount} received.`
    );
}


/* =========================================================
   PARKSMART RECEIPT
========================================================= */

function showParkSmartReceipt(booking) {

    const modal =
        document.getElementById("parkSmartReceiptModal");

    if (!modal) {
        return;
    }

    const payment = booking.payment || {};

    const set = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    };

    set("receiptAmountLarge", `₹${payment.amount || 0}`);
    set("receiptTxn", payment.txnId || "—");
    set("receiptDateTime",
        payment.paidAt
            ? new Date(payment.paidAt).toLocaleString()
            : "—"
    );
    set("receiptPaymentMethod", payment.method || "—");
    set("receiptVehicleType", booking.vehicleType || "—");
    set("receiptCarType", booking.carType || "—");
    set("receiptCarNumber", booking.carNumber || "—");
    set("receiptSlot", booking.slotId || "—");
    set("receiptDuration",
        `${booking.hours || 1} hour${Number(booking.hours) === 1 ? "" : "s"}`
    );
    set("receiptTotalPaid", `₹${payment.amount || 0}`);

    modal.hidden = false;
    modal.classList.add("show");
    modal.style.display = "flex";
}


/* =========================================================
   RECEIPT CLOSE + PRINT
========================================================= */

const closeParkSmartReceipt =
    document.getElementById("closeParkSmartReceipt");

if (closeParkSmartReceipt) {
    closeParkSmartReceipt.addEventListener(
        "click",
        function () {
            const modal =
                document.getElementById("parkSmartReceiptModal");

            if (modal) {
                modal.classList.remove("show");
                modal.style.display = "none";
                modal.hidden = true;
            }
        }
    );
}

const printParkSmartReceipt =
    document.getElementById("printParkSmartReceipt");

if (printParkSmartReceipt) {
    printParkSmartReceipt.addEventListener(
        "click",
        function () {
            window.print();
        }
    );
}

/* =========================================================
   GET CURRENTLY DISPLAYED PARKING
========================================================= */

function getCurrentlyDisplayedParking() {

    const searchText =
        parkingSearch
            ? parkingSearch.value
                .trim()
                .toLowerCase()
            : "";


    if (searchText === "") {

        return parkingData;

    }


    return parkingData.filter(
        parking => {

            const searchableText = [

                parking.name,
                parking.area,
                parking.locality,
                parking.city,
                parking.state

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            return searchableText.includes(
                searchText
            );

        }
    );

}


/* =========================================================
   BOOK BUTTONS
========================================================= */

const bookSelectedSlotButton =
    document.getElementById(
        "bookSelectedSlot"
    );


if (bookSelectedSlotButton) {

    bookSelectedSlotButton.addEventListener(
        "click",
        function () {

            bookSelectedParkingSlot();

        }
    );

}


const modalBookSlot =
    document.getElementById(
        "modalBookSlot"
    );


if (modalBookSlot) {

    modalBookSlot.addEventListener(
        "click",
        function () {

            bookSelectedParkingSlot();

        }
    );

}


/* =========================================================
   CLOSE SLOT MODAL
========================================================= */

function closeSlotModal() {

    const slotModal =
        document.getElementById(
            "slotModal"
        );


    if (slotModal) {

        slotModal.classList.remove(
            "show"
        );

        slotModal.classList.add(
            "hidden"
        );

        slotModal.style.display =
            "none";

    }

}


/* =========================================================
   SLOT MODAL CLOSE BUTTON
========================================================= */

const slotModalClose =
    document.getElementById(
        "slotModalClose"
    );


if (slotModalClose) {

    slotModalClose.addEventListener(
        "click",
        function () {

            closeSlotModal();

        }
    );

}


/* =========================================================
   CLOSE SLOT SECTION
========================================================= */

// const closeSlotSection =
//     document.getElementById(
//         "closeSlotSection"
//     );


// if (closeSlotSection) {

//     closeSlotSection.addEventListener(
//         "click",
//         function () {

//             const section =
//                 document.getElementById(
//                     "parkingSlotSection"
//                 );

//             if (section) {

//                 section.classList.add(
//                     "hidden"
//                 );

//             }

//         }
//     );

// }


/* =========================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================================= */

const slotModal =
    document.getElementById(
        "slotModal"
    );


if (slotModal) {

    slotModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                slotModal
            ) {

                closeSlotModal();

            }

        }
    );

}


/* =========================================================
   DISPLAY MY BOOKINGS
========================================================= */

function displayMyBookings() {

    const list =
        document.getElementById(
            "myBookingsList"
        );

    const count =
        document.getElementById(
            "bookingCount"
        );


    if (!list) {
        return;
    }


    const bookings =
        getBookings();


    if (count) {

        count.textContent =
            `${bookings.length} ${
                bookings.length === 1
                    ? "booking"
                    : "bookings"
            }`;

    }


    if (bookings.length === 0) {

        list.innerHTML = `

            <div class="no-bookings">

                <div class="no-bookings-icon">
                    🅿️
                </div>

                <p>
                    You don't have any reserved parking slots.
                </p>

                <small>
                    Select a parking location
                    and book a vacant slot.
                </small>

            </div>

        `;

        return;

    }


    list.innerHTML = "";


    bookings.forEach(
        booking => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "booking-card";


            card.innerHTML = `

                <div class="booking-card-header">

                    <div>

                        <strong>
                            ${booking.parkingName}
                        </strong>

                        <small>
                            📍
                            ${booking.parkingArea},
                            ${booking.parkingCity}
                        </small>

                    </div>

                    <span class="booking-status">
                        🟡 Reserved
                    </span>

                </div>


                <div class="booking-card-details">

                    <div>

                        <span>
                            Parking Slot
                        </span>

                        <strong>
                            ${booking.slotId}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Booking ID
                        </span>

                        <strong>
                            ${booking.id}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Booked On
                        </span>

                        <strong>
                            ${booking.createdAt}
                        </strong>

                    </div>

                </div>


                <button
                    type="button"
                    class="cancel-booking-btn"
                    onclick="cancelParkingBooking('${booking.id}')">

                    Cancel Reservation

                </button>

            `;


            list.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   CANCEL PARKING BOOKING
========================================================= */

function cancelParkingBooking(
    bookingId
) {

    const bookings =
        getBookings();


    const booking =
        bookings.find(
            item =>
                item.id ===
                bookingId
        );


    if (!booking) {

        showToast(
            "Booking not found."
        );

        return;

    }


    const confirmed =
        confirm(
            `Cancel reservation for slot ${booking.slotId}?`
        );


    if (!confirmed) {
        return;
    }


    /*
       Remove booking.
    */

    const remainingBookings =
        bookings.filter(
            item =>
                item.id !==
                bookingId
        );


    saveBookings(
        remainingBookings
    );


    /*
       Find parking.
    */

    const parking =
        parkingData.find(
            item =>
                Number(item.id) ===
                Number(booking.parkingId)
        );


    if (parking) {

        /*
           Increase available count.
        */

        parking.available++;


        /*
           Change slot back to vacant.
        */

        const slots =
            createParkingSlots(
                parking
            );


        const slot =
            slots.find(
                item =>
                    item.id ===
                    booking.slotId
            );


        if (slot) {

            slot.status =
                "vacant";

        }

    }


    /*
       Refresh parking list.
    */

    displayDashboardParking(
        getCurrentlyDisplayedParking()
    );


    /*
       Refresh bookings.
    */

    displayMyBookings();


    /*
       Refresh currently opened slot system.
    */

    if (
        selectedParking &&
        Number(selectedParking.id) ===
        Number(booking.parkingId)
    ) {

        displayParkingSlots(
            selectedParking
        );

        displayModalParkingSlots(
            selectedParking,
            createParkingSlots(
                selectedParking
            )
        );

    }


    showToast(
        `Reservation for slot ${booking.slotId} cancelled.`
    );

}


/* =========================================================
   SUCCESS MODAL
========================================================= */

const doneButton =
    document.getElementById(
        "doneButton"
    );


if (doneButton) {

    doneButton.addEventListener(
        "click",
        function () {

            const successModal =
                document.getElementById(
                    "successModal"
                );


            if (successModal) {

                successModal.classList.remove(
                    "show"
                );

            }


            /*
               Scroll to My Bookings.
            */

            const myBookingsSection =
                document.getElementById(
                    "myBookingsSection"
                );


            if (myBookingsSection) {

                myBookingsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


/* =========================================================
   PROFILE DROPDOWN
========================================================= */

const profileButton =
    document.getElementById(
        "profileButton"
    );


if (profileButton) {

    profileButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            const profileDropdown =
                document.getElementById(
                    "profileDropdown"
                );


            if (profileDropdown) {

                profileDropdown.classList.toggle(
                    "show"
                );

            }

        }
    );

}


/* =========================================================
   CLOSE PROFILE DROPDOWN
========================================================= */

document.addEventListener(
    "click",
    function () {

        const profileDropdown =
            document.getElementById(
                "profileDropdown"
            );


        if (profileDropdown) {

            profileDropdown.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   LOGOUT
========================================================= */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            const logout =
                confirm(
                    "Do you want to logout?"
                );


            if (!logout) {
                return;
            }


            localStorage.setItem(
                "parkSmartLoggedIn",
                "false"
            );


            if (dashboardView) {

                dashboardView.classList.add(
                    "hidden"
                );

                dashboardView.style.display =
                    "none";

            }


            const authPage =
                document.getElementById(
                    "authPage"
                );


            if (authPage) {

                authPage.style.display =
                    "flex";

            }


            showLogin();


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


            showToast(
                "You have been logged out."
            );

        }
    );

}


/* =========================================================
   CHECK EXISTING LOGIN
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loggedIn =
            localStorage.getItem(
                "parkSmartLoggedIn"
            );


        /*
           We don't automatically show dashboard
           here so that the login screen remains
           visible after refreshing unless the user
           has explicitly logged in during the session.
        */

        if (loggedIn === "true") {

            /*
               Uncomment the next line if you want
               automatic login after page refresh.

               showDashboard();
            */

        }

    }
);


/* =========================================================
   SIDEBAR: PAGES, RESERVATIONS, PAYMENTS, ENTRY & EXIT
========================================================= */

const PAGES = ["dashboard", "reservations", "payments", "logs"];

function escHtml(text) {
    const d = document.createElement("div");
    d.textContent = text == null ? "" : text;
    return d.innerHTML;
}

function showPage(name) {

    PAGES.forEach(p => {
        const el = document.getElementById(
            p === "dashboard" ? "dashboardSection" : "page-" + p
        );
        if (el) el.hidden = p !== name;
    });

    const slotsPage = document.getElementById("parkingSlotsPage");
    if (slotsPage) slotsPage.hidden = true;

    document.querySelectorAll(".sidebar-link[data-page]").forEach(b =>
        b.classList.toggle("active", b.dataset.page === name)
    );

    if (name === "dashboard" && parkingMap) {
        setTimeout(() => parkingMap.invalidateSize(), 0);
    }

    refreshSidebarPages();
    window.scrollTo({ top: 0 });
}

document.querySelectorAll(".sidebar-link[data-page]").forEach(b =>
    b.addEventListener("click", () => showPage(b.dataset.page))
);

const sidebarLogout = document.getElementById("sidebarLogout");
if (sidebarLogout) {
    sidebarLogout.addEventListener("click", () =>
        document.getElementById("logoutButton").click()
    );
}

/* Always open on the Dashboard page after login. */
const originalShowDashboard = showDashboard;
showDashboard = function () {
    originalShowDashboard();
    showPage("dashboard");
};

/* After booking, "Done" takes the user to Reservations. */
if (doneButton) doneButton.addEventListener("click", () => showPage("reservations"));


/* ---------- Photo storage (IndexedDB, not localStorage) ---------- */

const photoDB = new Promise((resolve, reject) => {
    const req = indexedDB.open("parkSmartPhotos", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("photos");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
});

async function savePhoto(id, dataUrl) {
    const db = await photoDB;
    return new Promise((res, rej) => {
        const tx = db.transaction("photos", "readwrite");
        tx.objectStore("photos").put(dataUrl, id);
        tx.oncomplete = res;
        tx.onerror = () => rej(tx.error);
    });
}

async function getPhoto(id) {
    const db = await photoDB;
    return new Promise(res => {
        const req = db.transaction("photos").objectStore("photos").get(id);
        req.onsuccess = () => res(req.result || "");
        req.onerror = () => res("");
    });
}

/* Opens the camera (phones) or file picker (desktop); returns a resized JPEG. */
function pickPhoto() {
    return new Promise(resolve => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.capture = "environment";
        input.addEventListener("cancel", () => resolve(null));
        input.addEventListener("change", () => {
            const file = input.files[0];
            if (!file) return resolve(null);
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, 800 / img.width);
                const canvas = document.createElement("canvas");
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.7));
            };
            img.onerror = () => resolve(null);
            img.src = URL.createObjectURL(file);
        });
        input.click();
    });
}


/* ---------- Booking helpers ---------- */

function updateBooking(id, changes) {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === id);
    if (!booking) return null;
    Object.assign(booking, changes);
    saveBookings(bookings);
    return booking;
}

function rateFor(booking) {
    const p = parkingData.find(x => Number(x.id) === Number(booking.parkingId));
    return p ? Number(p.rate) : 0;
}

const fmtTime = t => (t ? new Date(t).toLocaleString() : "—");


/* ---------- Reservations: status + cancel only while "Reserved" ---------- */

function decorateReservations() {
    const bookings = getBookings();
    document.querySelectorAll("#myBookingsList .booking-card").forEach((card, i) => {
        const b = bookings[i];
        if (!b) return;
        const label = b.status === "Completed" ? "🟢 Completed"
            : b.status === "Parked" ? "🔵 Parked" : "🟡 Reserved";
        const statusEl = card.querySelector(".booking-status");
        if (statusEl) statusEl.textContent = label;
        if (b.status === "Parked" || b.status === "Completed") {
            const cancel = card.querySelector(".cancel-booking-btn");
            if (cancel) cancel.remove();
        }
    });
}


/* ---------- Entry & Exit ---------- */

async function recordEntry(id) {
    const plate = (prompt("Vehicle plate number at entry:") || "").trim().toUpperCase();
    if (!plate) return showToast("Plate number is required.");

    const photo = await pickPhoto();
    if (!photo) return showToast("Entry photo is required.");

    const photoId = "entry-" + id;
    await savePhoto(photoId, photo);
    updateBooking(id, { status: "Parked", entry: { time: Date.now(), plate, photoId } });
    const bk = getBookings().find(b => b.id === id);
    addNotification(`🚗 Entry confirmed: ${plate} parked at ${bk.parkingName}, slot ${bk.slotId}, ${fmtTime(Date.now())}.`);
    refreshSidebarPages();
}

async function recordExit(id) {
    const booking = getBookings().find(b => b.id === id);
    if (!booking || !booking.entry) return;

    const plate = (prompt("Vehicle plate number at exit:") || "").trim().toUpperCase();
    if (!plate) return showToast("Plate number is required.");

    const photo = await pickPhoto();
    if (!photo) return showToast("Exit photo is required.");

    const match = plate === booking.entry.plate;
    if (!match && !confirm("Plate does not match the entry plate. Continue anyway?")) return;

    const photoId = "exit-" + id;
    await savePhoto(photoId, photo);

    const exitTime = Date.now();
    const hours = Math.max(1, Math.ceil((exitTime - booking.entry.time) / 3600000));
    const prepaid = booking.payment ? booking.payment.amount : 0;
    const extraAmt = Math.max(0, hours * rateFor(booking) - prepaid);

    updateBooking(id, {
        status: "Completed",
        exit: { time: exitTime, plate, photoId, match },
        extra: extraAmt > 0
            ? { hours, amount: extraAmt, status: "Pending", method: "", txnId: "", paidAt: null }
            : null
    });
    addNotification(`🏁 Exit completed (${hours} hr). ` +
        (extraAmt > 0 ? `Extra ₹${extraAmt} is due in Payments.` : "No extra payment due. Thank you!") +
        (match ? "" : " ⚠ Plate mismatch was flagged."));
    refreshSidebarPages();
}

function renderLogs() {
    const list = document.getElementById("logsList");
    if (!list) return;

    const bookings = getBookings().filter(b => b.status !== "Cancelled");
    if (bookings.length === 0) {
        list.innerHTML = '<div class="no-bookings"><p>No reservations yet.</p></div>';
        return;
    }

    list.innerHTML = bookings.map(b => {
        const box = (title, data, prefix) => `
            <div class="log-box">
                ${data ? `<img alt="${title} photo" data-photo="${data.photoId}">`
                       : '<div class="log-photo-empty">📷</div>'}
                <strong>${title}</strong>
                ${data ? `${fmtTime(data.time)}<br>Plate: ${escHtml(data.plate)}
                          ${prefix === "exit" && data.match === false ? '<br><span class="log-warn">⚠ Plate mismatch</span>' : ""}`
                       : "Not recorded"}
            </div>`;

        const action = b.status === "Reserved"
            ? `<button type="button" onclick="recordEntry('${b.id}')">📷 Record Entry</button>`
            : b.status === "Parked"
                ? `<button type="button" onclick="requestExitOtp('${b.id}')">🔐 Exit with OTP</button>`
                : "";

        return `
            <div class="booking-card">
                <div class="booking-card-header">
                    <div>
                        <strong>${escHtml(b.parkingName)}</strong>
                        <small>Slot ${escHtml(b.slotId)} · ${escHtml(b.id)}</small>
                    </div>
                    <span class="booking-status">${escHtml(b.status)}</span>
                </div>
                <div class="log-grid">${box("Entry", b.entry, "entry")}${box("Exit", b.exit, "exit")}</div>
                <div class="log-actions">${action}</div>
            </div>`;
    }).join("");

    list.querySelectorAll("img[data-photo]").forEach(img =>
        getPhoto(img.dataset.photo).then(src => { if (src) img.src = src; })
    );
}


/* ---------- Payments ---------- */

function payBooking(id, kind) {
    const b = getBookings().find(x => x.id === id);
    if (!b || !b[kind]) return;
    openPaymentModal(b[kind].amount, "Payment for " + b.parkingName, info => {
        updateBooking(id, { [kind]: Object.assign(b[kind], { status: "Paid" }, info) });
        addNotification(`✅ Payment of ₹${b[kind].amount} received for ${b.id}.`);
        refreshSidebarPages();
    });
}

function showReceipt(id, kind) {
    const b = getBookings().find(x => x.id === id);
    if (!b || !b[kind]) return;

    const p = b[kind];
    const detailsBox = document.getElementById("parkSmartPaymentDetails");
    if (!detailsBox) return;

    detailsBox.hidden = false;
    detailsBox.scrollIntoView({ behavior: "smooth", block: "nearest" });

    detailsBox.innerHTML = `
        <div class="parksmart-payment-receipt full-receipt-view">
            <div class="parksmart-payment-receipt-head">
                <div>
                    <span class="parksmart-payment-receipt-label">PARKING RECEIPT</span>
                    <h3>✓ Payment Successful</h3>
                    <p>${escHtml(b.parkingName || "ParkSmart")} · Slot ${escHtml(b.slotId || "—")}</p>
                </div>
                <strong>₹${Number(p.amount || 0)}</strong>
            </div>

            <div class="parksmart-payment-receipt-grid">
                <div><span>Booking ID</span><strong>${escHtml(b.id || "—")}</strong></div>
                <div><span>Transaction ID</span><strong>${escHtml(p.txnId || "—")}</strong></div>
                <div><span>Payment Method</span><strong>${escHtml(p.method || "—")}</strong></div>
                <div><span>Paid On</span><strong>${p.paidAt ? escHtml(new Date(p.paidAt).toLocaleString()) : "—"}</strong></div>
                <div><span>Parking</span><strong>${escHtml(b.parkingName || "—")}</strong></div>
                <div><span>Location</span><strong>${escHtml([b.parkingArea, b.parkingCity].filter(Boolean).join(", ") || "—")}</strong></div>
                <div><span>Vehicle</span><strong>${escHtml(b.vehicleType || "—")}</strong></div>
                <div><span>Car / Model</span><strong>${escHtml(b.carType || "—")}</strong></div>
                <div><span>Car Number</span><strong>${escHtml(b.carNumber || "—")}</strong></div>
                <div><span>Parking Slot</span><strong>${escHtml(b.slotId || "—")}</strong></div>
                <div><span>Duration</span><strong>${escHtml(`${b.hours || 1} hour${Number(b.hours) === 1 ? "" : "s"}`)}</strong></div>
                <div><span>Start Time</span><strong>${escHtml(b.startTime || "—")}</strong></div>
                <div><span>Status</span><strong class="parksmart-receipt-paid">PAID</strong></div>
            </div>

            <div class="parksmart-inline-receipt-total">
                <span>Total Paid</span>
                <strong>₹${Number(p.amount || 0)}</strong>
            </div>

            <div class="parksmart-payment-receipt-actions">
                <button type="button" class="secondary" onclick="window.print()">🖨 Print Receipt</button>
            </div>
        </div>`;
}

function renderPayments() {
    const body = document.getElementById("paymentsBody");
    if (!body) return;

    const rows = [];
    getBookings().forEach(b => {
        if (b.payment) rows.push({ b, p: b.payment, kind: "payment", label: "Reservation" });
        if (b.extra) rows.push({ b, p: b.extra, kind: "extra", label: "Extra time" });
    });

    const total = rows.filter(r => r.p.status === "Paid").reduce((t, r) => t + Number(r.p.amount || 0), 0);
    const totalEl = document.getElementById("totalPaid");
    if (totalEl) totalEl.textContent = `Total paid: ₹${total}`;

    body.innerHTML = rows.length === 0
        ? '<tr><td colspan="7">No payments yet. Book a slot to make your first payment.</td></tr>'
        : rows.map(({ b, p, kind, label }) => {
            const paid = p.status === "Paid";
            return `<tr>
                <td>${escHtml(b.id)}</td><td>${escHtml(b.parkingName)}</td>
                <td>${p.hours || b.hours || 1} hr · ${label}</td><td>₹${p.amount}</td>
                <td>${escHtml(p.method) || "—"}</td>
                <td class="${paid ? "pay-paid" : "pay-pending"}">${p.status}</td>
                <td>${paid
                    ? `<button type="button" onclick="showReceipt('${String(b.id).replace(/'/g, "\\'")}','${kind}')">Receipt</button>`
                    : `<button type="button" onclick="payBooking('${String(b.id).replace(/'/g, "\\'")}','${kind}')">Pay now</button>`}</td>
            </tr>`;
        }).join("");

    // Payment Details starts empty. Clicking Receipt above fills this same section.
    const detailsBox = document.getElementById("parkSmartPaymentDetails");
    if (detailsBox && !detailsBox.classList.contains("full-receipt-view")) {
        detailsBox.hidden = true;
        detailsBox.innerHTML = "";
    }
}

function refreshSidebarPages() {
    decorateReservations();
    renderPayments();
    renderLogs();
}

/* Keep the new pages in sync whenever bookings are redrawn. */
const originalDisplayMyBookings = displayMyBookings;
displayMyBookings = function () {
    originalDisplayMyBookings();
    refreshSidebarPages();
};



/* =========================================================
   NOTIFICATIONS (in-app + browser, works offline)
========================================================= */

const NOTIF_KEY = "parkSmartNotifs";
const bell = document.querySelector(".dashboard-notification");
let notifPanel = null;

function getNotifs() {
    try { return JSON.parse(localStorage.getItem(NOTIF_KEY)) || []; } catch (e) { return []; }
}

function askNotifPermission() {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
}

function addNotification(msg) {
    const list = getNotifs();
    list.unshift({ msg, time: Date.now(), read: false });
    localStorage.setItem(NOTIF_KEY, JSON.stringify(list.slice(0, 30)));
    showToast(msg);
    renderNotifs();
    if ("Notification" in window && Notification.permission === "granted") {
        try { new Notification("ParkSmart", { body: msg }); } catch (e) { /* ignore */ }
    }
}

function renderNotifs() {
    const list = getNotifs();
    const dot = bell && bell.querySelector("span");
    if (dot) dot.style.display = list.some(n => !n.read) ? "block" : "none";
    if (!notifPanel) return;
    notifPanel.innerHTML =
        '<div class="notif-head"><strong>Notifications</strong><button type="button" id="notifClear">Clear</button></div>' +
        (list.length
            ? list.map(n => `<div class="notif-item${n.read ? "" : " unread"}">${escHtml(n.msg)}<small>${fmtTime(n.time)}</small></div>`).join("")
            : '<div class="notif-item">No notifications yet</div>');
    document.getElementById("notifClear").onclick = () => { localStorage.removeItem(NOTIF_KEY); renderNotifs(); };
}

if (bell) {
    notifPanel = document.createElement("div");
    notifPanel.className = "notif-panel";
    bell.parentElement.appendChild(notifPanel);
    bell.addEventListener("click", e => {
        e.stopPropagation();
        askNotifPermission();
        renderNotifs();
        notifPanel.classList.toggle("show");
        localStorage.setItem(NOTIF_KEY, JSON.stringify(getNotifs().map(n => ({ ...n, read: true }))));
        const dot = bell.querySelector("span");
        if (dot) dot.style.display = "none";
    });
    notifPanel.addEventListener("click", e => e.stopPropagation());
    document.addEventListener("click", () => notifPanel.classList.remove("show"));
    renderNotifs();
}


/* =========================================================
   GENERIC MODAL + DEMO PAYMENT
========================================================= */

let otpTimer = null;

function openModal(html) {
    const modal = document.getElementById("demoModal");
    modal.querySelector(".success-box").innerHTML = html;
    modal.hidden = false;
    modal.classList.add("show");
    modal.style.display = "flex";
    return modal;
}

function closeModal() {
    clearInterval(otpTimer);
    const modal = document.getElementById("demoModal");
    if (modal) {
        modal.classList.remove("show");
        modal.style.display = "none";
        modal.hidden = true;
    }
}

const PAY_FIELDS = {
    upi: '<input class="pay-input" id="pf1" placeholder="yourname@bank">',
    card: '<input class="pay-input" id="pf1" placeholder="Card number" maxlength="19">' +
          '<div class="pay-row"><input class="pay-input" id="pf2" placeholder="MM/YY" maxlength="5">' +
          '<input class="pay-input" id="pf3" placeholder="CVV" maxlength="3"></div>',
    wallet: '<p class="pay-demo-note">ParkWallet (demo balance ₹5000) will be used.</p>'
};

const PAY_DEMO = {
    upi: ["demo@parksmart"],
    card: ["4242 4242 4242 4242", "12/30", "123"],
    wallet: []
};

function openPaymentModal(amount, title, onSuccess) {

    let method = "upi";

    openModal(`
        <h2>Demo Payment</h2>
        <p>${escHtml(title)}<br><strong>Amount: ₹${amount}</strong></p>
        <div class="pay-tabs">
            <button type="button" data-m="upi" class="active">UPI</button>
            <button type="button" data-m="card">Card</button>
            <button type="button" data-m="wallet">Wallet</button>
        </div>
        <div id="payFields">${PAY_FIELDS.upi}</div>
        <p class="pay-demo-note">🧪 Demo only. No real money is charged.<br>
        Test card 4242… succeeds, 4000 0000 0000 0002 is declined.</p>
        <p id="payMsg" class="log-warn"></p>
        <button type="button" id="payFill" class="pay-ghost">Fill demo details</button>
        <button type="button" id="payNow" class="confirm-booking">Pay ₹${amount}</button>
        <button type="button" id="payCancel" class="pay-ghost">Cancel</button>`);

    const $ = id => document.getElementById(id);

    document.querySelectorAll(".pay-tabs button").forEach(btn => btn.addEventListener("click", () => {
        method = btn.dataset.m;
        document.querySelectorAll(".pay-tabs button").forEach(x => x.classList.toggle("active", x === btn));
        $("payFields").innerHTML = PAY_FIELDS[method];
        $("payMsg").textContent = "";
    }));

    $("payFill").onclick = () =>
        PAY_DEMO[method].forEach((v, i) => { $("pf" + (i + 1)).value = v; });

    $("payCancel").onclick = closeModal;

    $("payNow").onclick = () => {
        const v = i => ($("pf" + i) ? $("pf" + i).value.trim() : "");
        const digits = v(1).replace(/\s/g, "");
        let label = "Wallet", error = "";

        if (method === "upi") {
            label = "UPI";
            if (!/^[\w.\-]+@[\w]+$/.test(v(1))) error = "Enter a valid UPI ID (name@bank).";
        } else if (method === "card") {
            label = "Card ••" + digits.slice(-4);
            if (!/^\d{16}$/.test(digits)) error = "Enter a 16-digit card number.";
            else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v(2))) error = "Expiry must be MM/YY.";
            else if (!/^\d{3}$/.test(v(3))) error = "Enter the 3-digit CVV.";
        }
        if (error) { $("payMsg").textContent = error; return; }

        askNotifPermission();
        $("payNow").disabled = true;
        $("payNow").textContent = "Processing…";

        setTimeout(() => {
            if (digits === "4000000000000002") {
                $("payMsg").textContent = "Card declined (demo). Try the 4242 test card.";
                $("payNow").disabled = false;
                $("payNow").textContent = `Pay ₹${amount}`;
                return;
            }
            closeModal();
            onSuccess({
                method: label,
                txnId: "TX" + Math.floor(100000 + Math.random() * 900000),
                paidAt: Date.now()
            });
        }, 1500);
    };
}

/*
   IMPORTANT:
   Do not open the old Demo Payment modal when the user clicks
   "Book Selected Slot". The active flow is:
   Book Selected Slot -> Booking Details -> Save & Continue -> ParkSmart Payment.
   The older demo-payment wrapper was overriding bookSelectedParkingSlot()
   and has intentionally been removed.
*/


/* =========================================================
   EXIT OTP (valid 2 minutes, generated on-device:
   no SMS, mobile balance or network needed)
========================================================= */

let otpState = null;

function requestExitOtp(id) {

    const b = getBookings().find(x => x.id === id);
    if (!b) return;

    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0");
    otpState = { id, code, expires: Date.now() + 120000, attempts: 0 };

    askNotifPermission();
    addNotification(`🔐 Exit OTP for slot ${b.slotId}: ${code}. Valid for 2 minutes. Do not share it.`);

    openModal(`
        <h2>Exit Verification</h2>
        <p>Your OTP is in your ParkSmart notifications (🔔). No SMS or internet is needed.</p>
        <input class="pay-input" id="otpInput" inputmode="numeric" maxlength="6" placeholder="6-digit OTP">
        <p id="otpTimerText" class="pay-demo-note"></p>
        <p id="otpMsg" class="log-warn"></p>
        <button type="button" id="otpVerify" class="confirm-booking">Verify &amp; Exit</button>
        <button type="button" id="otpResend" class="pay-ghost">Resend OTP</button>
        <button type="button" id="otpCancel" class="pay-ghost">Cancel</button>`);

    const $ = x => document.getElementById(x);

    const tick = () => {
        const left = Math.max(0, Math.ceil((otpState ? otpState.expires - Date.now() : 0) / 1000));
        $("otpTimerText").textContent = left
            ? `OTP expires in ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`
            : "OTP expired. Tap Resend OTP.";
        if (!left) { otpState = null; $("otpVerify").disabled = true; clearInterval(otpTimer); }
    };

    clearInterval(otpTimer);
    otpTimer = setInterval(tick, 1000);
    tick();

    $("otpCancel").onclick = () => { otpState = null; closeModal(); };
    $("otpResend").onclick = () => requestExitOtp(id);

    $("otpVerify").onclick = () => {
        if (!otpState || Date.now() > otpState.expires) {
            $("otpMsg").textContent = "OTP expired. Please resend.";
            $("otpVerify").disabled = true;
            otpState = null;
            return;
        }
        if ($("otpInput").value.trim() === otpState.code) {
            otpState = null;
            closeModal();
            recordExit(id);
            return;
        }
        otpState.attempts++;
        if (otpState.attempts >= 3) {
            otpState = null;
            $("otpVerify").disabled = true;
            $("otpMsg").textContent = "Too many wrong attempts. Resend a new OTP.";
        } else {
            $("otpMsg").textContent = `Wrong OTP (${otpState.attempts}/3).`;
        }
    };
}


/* =========================================================
   SEARCH ANY PLACE (OpenStreetMap) + NEAREST PARKING
========================================================= */

let nearbyList = null, searchMarker = null, geoTimer = null;

function distanceKm(lat1, lng1, lat2, lng2) {
    const r = Math.PI / 180, dLat = (lat2 - lat1) * r, dLng = (lng2 - lng1) * r;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(a));
}

const originalPerformSearch = performParkingSearch;
const originalDisplayed = getCurrentlyDisplayedParking;

getCurrentlyDisplayedParking = function () {
    const list = originalDisplayed();
    return list.length ? list : (nearbyList || list);
};

performParkingSearch = function () {
    nearbyList = null;
    clearTimeout(geoTimer);
    originalPerformSearch();
    const q = parkingSearch ? parkingSearch.value.trim() : "";
    if (q === "" && searchMarker && parkingMap) { parkingMap.removeLayer(searchMarker); searchMarker = null; }
    if (q.length >= 3 && originalDisplayed().length === 0) {
        geoTimer = setTimeout(() => geocodeSearch(q), 700);
    }
};

async function geocodeSearch(q) {

    const say = text => { if (searchResults) searchResults.innerHTML = `<div class="search-result-message">${text}</div>`; };
    say(`Searching for "${escHtml(q)}"…`);

    try {
        const res = await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=" + encodeURIComponent(q));
        const data = await res.json();
        if (q !== parkingSearch.value.trim()) return;
        if (!data.length) return say(`Place "${escHtml(q)}" not found.`);

        const lat = +data[0].lat, lng = +data[0].lon;
        const ranked = parkingData
            .map(p => ({ p, d: distanceKm(lat, lng, p.lat, p.lng) }))
            .filter(item => item.d <= 15)
            .sort((a, b) => a.d - b.d);

        nearbyList = ranked.map(x => x.p);
        displayDashboardParking(nearbyList);

        const name = data[0].display_name.split(",").slice(0, 2).join(",");
        if (parkingMap) {
            if (searchMarker) parkingMap.removeLayer(searchMarker);
            searchMarker = L.marker([lat, lng]).addTo(parkingMap).bindPopup("📍 " + escHtml(name)).openPopup();
            parkingMap.setView([lat, lng], 12);
        }
        const loc = document.getElementById("selectedLocationText");
        const head = document.getElementById("parkingHeading");
        if (loc) loc.textContent = name;
        if (head) head.textContent = ranked.length ? "Parking near this location" : "No parking found";

        if (!ranked.length) {
            say(`No ParkSmart parking was found within 15 km of ${escHtml(name)}.`);
        } else {
            say(`${ranked.length} parking location(s) found near ${escHtml(name)}.`);
        }

    } catch (e) {
        say("Could not search this place. Check your internet connection.");
    }
}

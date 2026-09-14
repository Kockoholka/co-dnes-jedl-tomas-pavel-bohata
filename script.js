const mealList = document.getElementById("meal-list");

const kebabWeek = document.getElementById("kebab-week");
const kebabMonth = document.getElementById("kebab-month");
const vegetableDays = document.getElementById("vegetable-days");
const totalCount = document.getElementById("total-count");

const currentDate = document.getElementById("current-date");


function getLocalDateString(date = new Date()) {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function parseDate(dateString) {

    const [year, month, day] = dateString
        .split("-")
        .map(Number);

    return new Date(year, month - 1, day, 12, 0, 0);
}


function showCurrentDate() {

    const today = new Date();

    const formattedDate = today.toLocaleDateString("cs-CZ", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    currentDate.textContent =
        formattedDate.charAt(0).toUpperCase() +
        formattedDate.slice(1);
}


async function loadMeals() {

    try {

        const response = await fetch("data.json");

        if (!response.ok) {
            throw new Error("Nepodařilo se načíst data.");
        }

        const meals = await response.json();

        displayToday(meals);
        displayStatistics(meals);

    }

    catch (error) {

        console.error(error);

        mealList.innerHTML = `
            <div class="empty">
                <h3>Databáze obědů je momentálně nedostupná.</h3>
                <p>Oddělení Food Intelligence bylo informováno.</p>
            </div>
        `;
    }
}


function displayToday(meals) {

    const today = getLocalDateString();

    const todaysLunch = meals.find(meal =>
        meal.date === today
    );


    if (!todaysLunch) {

        mealList.innerHTML = `
            <div class="empty">

                <h3>Tomíkův dnešní oběd zatím nebyl zaznamenán.</h3>

                <p>
                    Stravovací situaci nadále monitorujeme.
                </p>

            </div>
        `;

        return;
    }


    const rating =
        typeof todaysLunch.rating === "number"
            ? `<div class="meal-rating">⭐ ${todaysLunch.rating}/10</div>`
            : "";


    const note =
        todaysLunch.note
            ? `<p class="meal-note">${todaysLunch.note}</p>`
            : "";


    mealList.innerHTML = `

        <article class="meal-card">

            <div class="meal-icon">
                ${todaysLunch.icon || "🍽️"}
            </div>

            <div>

                <p class="meal-time">
                    DNEŠNÍ OBĚD
                </p>

                <p class="meal-name">
                    ${todaysLunch.food}
                </p>

                ${note}

            </div>

            ${rating}

        </article>

    `;
}


function displayStatistics(meals) {

    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();


    /* -------------------------
       KEBABY TENTO MĚSÍC
    ------------------------- */

    const kebabsThisMonth = meals.filter(meal => {

        const date = parseDate(meal.date);

        return (
            date.getFullYear() === currentYear &&
            date.getMonth() === currentMonth &&
            meal.tags?.includes("kebab")
        );

    }).length;


    kebabMonth.textContent = kebabsThisMonth;



    /* -------------------------
       KEBABY TENTO TÝDEN
    ------------------------- */

    const monday = new Date(now);

    const day = monday.getDay();

    const distanceFromMonday =
        day === 0 ? 6 : day - 1;

    monday.setDate(
        monday.getDate() - distanceFromMonday
    );

    monday.setHours(0, 0, 0, 0);


    const sunday = new Date(monday);

    sunday.setDate(
        monday.getDate() + 6
    );

    sunday.setHours(23, 59, 59, 999);


    const kebabsThisWeek = meals.filter(meal => {

        const date = parseDate(meal.date);

        return (
            date >= monday &&
            date <= sunday &&
            meal.tags?.includes("kebab")
        );

    }).length;


    kebabWeek.textContent = kebabsThisWeek;



    /* -------------------------
       POSLEDNÍ ZELENINA
    ------------------------- */

    const vegetableMeals = meals
        .filter(meal =>
            meal.vegetables === true &&
            parseDate(meal.date) <= now
        )
        .sort(
            (a, b) =>
                parseDate(b.date) -
                parseDate(a.date)
        );


    if (vegetableMeals.length === 0) {

        vegetableDays.textContent = "∞";

    }

    else {

        const lastVegetable =
            parseDate(vegetableMeals[0].date);


        const todayUTC = Date.UTC(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


        const vegetableUTC = Date.UTC(
            lastVegetable.getFullYear(),
            lastVegetable.getMonth(),
            lastVegetable.getDate()
        );


        const difference =
            Math.floor(
                (todayUTC - vegetableUTC) /
                (1000 * 60 * 60 * 24)
            );


        vegetableDays.textContent =
            Math.max(0, difference);
    }



    /* -------------------------
       CELKOVÝ POČET OBĚDŮ
    ------------------------- */

    totalCount.textContent = meals.length;
}


showCurrentDate();
loadMeals();

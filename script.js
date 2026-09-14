/* =========================================
   ELEMENTY STRÁNKY
========================================= */

const mealList =
    document.getElementById("meal-list");

const historyList =
    document.getElementById("history-list");

const kebabWeek =
    document.getElementById("kebab-week");

const kebabMonth =
    document.getElementById("kebab-month");

const vegetableDays =
    document.getElementById("vegetable-days");

const fastFoodShare =
    document.getElementById("fast-food-share");

const averageRating =
    document.getElementById("average-rating");

const totalCount =
    document.getElementById("total-count");

const currentDate =
    document.getElementById("current-date");



/* =========================================
   PRÁCE S DATEM
========================================= */

function getLocalDateString(date = new Date()) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}



function parseDate(dateString) {

    const [
        year,
        month,
        day
    ] = dateString
        .split("-")
        .map(Number);

    /*
       Používáme poledne, aby nám do
       výpočtů zbytečně nezasahovaly
       změny časových pásem / DST.
    */

    return new Date(
        year,
        month - 1,
        day,
        12,
        0,
        0
    );
}



function formatHistoryDate(dateString) {

    const date =
        parseDate(dateString);

    return date.toLocaleDateString(
        "cs-CZ",
        {
            day: "numeric",
            month: "numeric",
            year: "numeric"
        }
    );
}



function showCurrentDate() {

    const today =
        new Date();

    const formattedDate =
        today.toLocaleDateString(
            "cs-CZ",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    currentDate.textContent =
        formattedDate
            .charAt(0)
            .toUpperCase()
        +
        formattedDate.slice(1);
}



/* =========================================
   BEZPEČNÉ VKLÁDÁNÍ TEXTU
========================================= */

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}



/* =========================================
   ČITELNÝ NÁZEV TAGU
========================================= */

function formatTag(tag) {

    return tag
        .replaceAll("-", " ");
}



/* =========================================
   NAČTENÍ DAT
========================================= */

async function loadMeals() {

    try {

        const response =
            await fetch(
                "data.json",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Nepodařilo se načíst data."
            );
        }


        const meals =
            await response.json();


        displayToday(meals);

        displayStatistics(meals);

        displayHistory(meals);

    }

    catch (error) {

        console.error(error);


        mealList.innerHTML = `
            <div class="empty">

                <h3>
                    Databáze obědů je momentálně nedostupná.
                </h3>

                <p>
                    Oddělení Food Intelligence bylo informováno.
                </p>

            </div>
        `;


        historyList.innerHTML = `
            <div class="empty">

                <p>
                    Historické záznamy nelze načíst.
                </p>

            </div>
        `;
    }
}



/* =========================================
   DNEŠNÍ OBĚD
========================================= */

function displayToday(meals) {

    const today =
        getLocalDateString();


    const todaysLunch =
        meals.find(
            meal =>
                meal.date === today
        );


    if (!todaysLunch) {

        mealList.innerHTML = `
            <div class="empty">

                <h3>
                    Tomíkův dnešní oběd zatím nebyl zaznamenán.
                </h3>

                <p>
                    Stravovací situaci nadále monitorujeme.
                </p>

            </div>
        `;

        return;
    }


    const rating =
        typeof todaysLunch.rating === "number"
        ?
        `
            <div class="meal-rating">
                ⭐ ${todaysLunch.rating}/10
            </div>
        `
        :
        "";


    const note =
        todaysLunch.note
        ?
        `
            <p class="meal-note">
                ${escapeHtml(todaysLunch.note)}
            </p>
        `
        :
        "";


    mealList.innerHTML = `

        <article class="meal-card">

            <div class="meal-icon">

                ${escapeHtml(
                    todaysLunch.icon || "🍽️"
                )}

            </div>


            <div>

                <p class="meal-time">
                    DNEŠNÍ OBĚD
                </p>

                <p class="meal-name">

                    ${escapeHtml(
                        todaysLunch.food
                    )}

                </p>

                ${note}

            </div>


            ${rating}


        </article>

    `;
}



/* =========================================
   STATISTIKY
========================================= */

function displayStatistics(meals) {

    const now =
        new Date();

    const todayString =
        getLocalDateString();


    /*
       Do statistik nezahrnujeme
       případné budoucí záznamy.
    */

    const currentMeals =
        meals.filter(
            meal =>
                meal.date <= todayString
        );


    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth();



    /* =====================================
       KEBABY TENTO MĚSÍC
    ===================================== */

    const kebabsThisMonth =
        currentMeals.filter(
            meal => {

                const date =
                    parseDate(meal.date);

                return (
                    date.getFullYear()
                        === currentYear
                    &&
                    date.getMonth()
                        === currentMonth
                    &&
                    meal.tags?.includes(
                        "kebab"
                    )
                );
            }
        ).length;


    kebabMonth.textContent =
        kebabsThisMonth;



    /* =====================================
       KEBABY TENTO TÝDEN
       Pondělí → Neděle
    ===================================== */

    const monday =
        new Date(now);


    const day =
        monday.getDay();


    const distanceFromMonday =
        day === 0
            ? 6
            : day - 1;


    monday.setDate(
        monday.getDate()
        -
        distanceFromMonday
    );


    monday.setHours(
        0,
        0,
        0,
        0
    );


    const sunday =
        new Date(monday);


    sunday.setDate(
        monday.getDate() + 6
    );


    sunday.setHours(
        23,
        59,
        59,
        999
    );


    const kebabsThisWeek =
        currentMeals.filter(
            meal => {

                const date =
                    parseDate(meal.date);

                return (
                    date >= monday
                    &&
                    date <= sunday
                    &&
                    meal.tags?.includes(
                        "kebab"
                    )
                );
            }
        ).length;


    kebabWeek.textContent =
        kebabsThisWeek;



    /* =====================================
       DNY OD POSLEDNÍ ZELENINY
    ===================================== */

    const vegetableMeals =
        currentMeals

            .filter(
                meal =>
                    meal.vegetables === true
            )

            .sort(
                (a, b) =>
                    parseDate(b.date)
                    -
                    parseDate(a.date)
            );


    if (
        vegetableMeals.length === 0
    ) {

        vegetableDays.textContent =
            "∞";

    }

    else {

        const lastVegetable =
            parseDate(
                vegetableMeals[0].date
            );


        const todayUTC =
            Date.UTC(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );


        const vegetableUTC =
            Date.UTC(
                lastVegetable.getFullYear(),
                lastVegetable.getMonth(),
                lastVegetable.getDate()
            );


        const difference =
            Math.floor(
                (
                    todayUTC
                    -
                    vegetableUTC
                )
                /
                (
                    1000
                    *
                    60
                    *
                    60
                    *
                    24
                )
            );


        vegetableDays.textContent =
            Math.max(
                0,
                difference
            );
    }



    /* =====================================
       PODÍL FAST FOODU
    ===================================== */

    if (
        currentMeals.length === 0
    ) {

        fastFoodShare.textContent =
            "–";

    }

    else {

        const fastFoodCount =
            currentMeals.filter(
                meal =>
                    meal.tags?.includes(
                        "fast-food"
                    )
            ).length;


        const share =
            Math.round(
                (
                    fastFoodCount
                    /
                    currentMeals.length
                )
                *
                100
            );


        fastFoodShare.textContent =
            `${share} %`;
    }



    /* =====================================
       PRŮMĚRNÉ HODNOCENÍ
    ===================================== */

    const ratedMeals =
        currentMeals.filter(
            meal =>
                typeof meal.rating
                === "number"
        );


    if (
        ratedMeals.length === 0
    ) {

        averageRating.textContent =
            "–";

    }

    else {

        const ratingSum =
            ratedMeals.reduce(
                (sum, meal) =>
                    sum + meal.rating,
                0
            );


        const average =
            ratingSum
            /
            ratedMeals.length;


        averageRating.textContent =
            average.toFixed(1);
    }



    /* =====================================
       CELKOVÝ POČET OBĚDŮ
    ===================================== */

    totalCount.textContent =
        currentMeals.length;
}



/* =========================================
   HISTORIE OBĚDŮ
========================================= */

function displayHistory(meals) {

    const today =
        getLocalDateString();


    /*
       Dnešní oběd je už zobrazen nahoře,
       proto do historie dáváme pouze
       předchozí dny.
    */

    const historicalMeals =
        meals

            .filter(
                meal =>
                    meal.date < today
            )

            .sort(
                (a, b) =>
                    parseDate(b.date)
                    -
                    parseDate(a.date)
            );


    if (
        historicalMeals.length === 0
    ) {

        historyList.innerHTML = `

            <div class="empty">

                <h3>
                    Historie je zatím prázdná.
                </h3>

                <p>
                    Archiv potřebuje více stravovacích incidentů.
                </p>

            </div>

        `;

        return;
    }


    historyList.innerHTML =
        historicalMeals
            .map(
                meal =>
                    createHistoryItem(meal)
            )
            .join("");
}



/* =========================================
   JEDEN ZÁZNAM HISTORIE
========================================= */

function createHistoryItem(meal) {

    const tags =
        Array.isArray(meal.tags)
        &&
        meal.tags.length > 0

        ?

        meal.tags
            .map(
                tag => `
                    <span class="tag">
                        ${escapeHtml(
                            formatTag(tag)
                        )}
                    </span>
                `
            )
            .join("")

        :

        `
            <span class="tag">
                bez tagu
            </span>
        `;



    const vegetableStatus =
        meal.vegetables === true

        ?

        `
            <span
                class="
                    vegetable-status
                    vegetable-yes
                "
            >
                ✓ Ano
            </span>
        `

        :

        `
            <span
                class="
                    vegetable-status
                    vegetable-no
                "
            >
                ✕ Ne
            </span>
        `;



    const note =
        meal.note
        ?
        escapeHtml(meal.note)
        :
        "Bez komentáře.";



    const rating =
        typeof meal.rating === "number"
        ?
        `${meal.rating}/10`
        :
        "–";



    return `

        <details class="history-item">


            <summary class="history-summary">


                <span class="history-arrow">
                    ▶
                </span>


                <span class="history-date">

                    ${formatHistoryDate(
                        meal.date
                    )}

                </span>


                <span class="history-food">

                    ${escapeHtml(
                        meal.icon || "🍽️"
                    )}

                    ${escapeHtml(
                        meal.food
                    )}

                </span>


                <span class="history-rating">

                    ⭐ ${rating}

                </span>


            </summary>



            <div class="history-content">


                <div class="history-meal-header">


                    <div class="history-icon">

                        ${escapeHtml(
                            meal.icon || "🍽️"
                        )}

                    </div>


                    <div class="history-meal-name">

                        ${escapeHtml(
                            meal.food
                        )}

                    </div>


                </div>



                <div class="history-detail">

                    <p class="history-detail-label">
                        Hodnocení
                    </p>

                    <p class="history-detail-value">
                        ⭐ ${rating}
                    </p>

                </div>



                <div class="history-detail">

                    <p class="history-detail-label">
                        Poznámka
                    </p>

                    <p class="history-detail-value">
                        ${note}
                    </p>

                </div>



                <div class="history-detail">

                    <p class="history-detail-label">
                        Tagy
                    </p>

                    <div class="tag-list">
                        ${tags}
                    </div>

                </div>



                <div class="history-detail">

                    <p class="history-detail-label">
                        Výskyt zeleniny
                    </p>

                    <div>
                        ${vegetableStatus}
                    </div>

                </div>


            </div>


        </details>

    `;
}



/* =========================================
   START STRÁNKY
========================================= */

showCurrentDate();

loadMeals();

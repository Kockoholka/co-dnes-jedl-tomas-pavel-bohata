const mealList = document.getElementById("meal-list");

const todayCount = document.getElementById("today-count");
const averageRating = document.getElementById("average-rating");
const totalCount = document.getElementById("total-count");

const currentDate = document.getElementById("current-date");


function getLocalDateString() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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

        displayMeals(meals);
        displayStatistics(meals);

    }

    catch (error) {

        console.error(error);

        mealList.innerHTML = `
            <div class="empty">
                Data se nepodařilo načíst.
            </div>
        `;
    }
}


function displayMeals(meals) {

    const today = getLocalDateString();

    const todaysMeals = meals.filter(meal =>
        meal.date === today
    );


    if (todaysMeals.length === 0) {

        mealList.innerHTML = `
            <div class="empty">
                <h3>Dnes zatím nic zaznamenáno.</h3>
                <p>Situaci nadále monitorujeme.</p>
            </div>
        `;

        return;
    }


    todaysMeals.sort((a, b) =>
        a.time.localeCompare(b.time)
    );


    mealList.innerHTML = todaysMeals.map(meal => `

        <article class="meal-card">

            <div class="meal-icon">
                ${meal.icon}
            </div>

            <div>

                <p class="meal-time">
                    ${meal.time} • ${meal.category}
                </p>

                <p class="meal-name">
                    ${meal.food}
                </p>

                <p class="meal-note">
                    ${meal.note}
                </p>

            </div>

            <div class="meal-rating">
                ⭐ ${meal.rating}/10
            </div>

        </article>

    `).join("");
}


function displayStatistics(meals) {

    const today = getLocalDateString();

    const todaysMeals = meals.filter(meal =>
        meal.date === today
    );


    todayCount.textContent = todaysMeals.length;

    totalCount.textContent = meals.length;


    if (todaysMeals.length > 0) {

        const totalRating = todaysMeals.reduce(
            (sum, meal) => sum + meal.rating,
            0
        );

        const average =
            totalRating / todaysMeals.length;

        averageRating.textContent =
            average.toFixed(1);

    }

    else {

        averageRating.textContent = "–";
    }
}


showCurrentDate();
loadMeals();

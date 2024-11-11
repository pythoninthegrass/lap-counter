let lapCount = 0;
let lastValidLapTime = null; // Holds the time of the last counted lap
let totalLapTime = 0;
let validLaps = 0;
const laps = [];

const lapButton = document.getElementById("lapButton");
const lapBody = document.getElementById("lapBody");
const lapCountDisplay = document.getElementById("lapCount");
const avgLapTimeDisplay = document.getElementById("avgLapTime");

lapButton.addEventListener("click", () => {
	recordLap();
});

function recordLap() {
	const currentTime = new Date();
	lapCount++;

	// Calculate time since last valid (counted) lap
	let timeSinceLastLap = 0;
	if (lastValidLapTime !== null) {
		timeSinceLastLap = (currentTime - lastValidLapTime) / 1000;
		totalLapTime += timeSinceLastLap;
		validLaps++;
	}
	lastValidLapTime = currentTime;

	// Create a new lap entry
	const lapEntry = {
		lapNumber: lapCount, // We'll renumber this later
		lapTime: currentTime,
		lapDuration: timeSinceLastLap,
		isCounted: true,
	};
	laps.push(lapEntry);

	// Renumber laps and update the table
	renumberLaps();
	updateTable();
	updateStats();
}

function splitLap(index) {
	const lapToSplit = laps[index];
	if (lapToSplit.lapDuration === 0) return;

	// Calculate the split duration
	const splitDuration = lapToSplit.lapDuration / 2;

	// Adjust the time for the new split lap
	const newLapTime = new Date(
		lapToSplit.lapTime.getTime() - splitDuration * 1000,
	);

	// Update the lap being split
	lapToSplit.lapDuration = splitDuration;

	// Insert a new lap after the split lap with adjusted time and duration
	const newLap = {
		lapNumber: lapCount + 1, // Will be renumbered
		lapTime: newLapTime,
		lapDuration: splitDuration,
		isCounted: true,
	};
	laps.splice(index + 1, 0, newLap);

	lapCount++;
	validLaps++;
	totalLapTime += splitDuration;

	// Renumber laps and update the table
	renumberLaps();
	updateTable();
	updateStats();
}

function toggleLap(lapEntry, row, lapIndex) {
	const button = row.querySelector(".toggleLapButton");

	if (lapEntry.isCounted) {
		// Mark as "not counted"
		lapEntry.isCounted = false;
		row.classList.add("not-counted");
		button.textContent = "Undo";
		validLaps--;
		// totalLapTime -= lapEntry.lapDuration;

		// Recalculate subsequent laps
		recalculateLaps(lapIndex);
	} else {
		// Undo the "not counted" action
		lapEntry.isCounted = true;
		row.classList.remove("not-counted");
		button.textContent = "Skip";
		validLaps++;
		// totalLapTime += lapEntry.lapDuration;

		// Recalculate subsequent laps
		recalculateLaps(lapIndex);
	}

	// Renumber laps and update the stats
	renumberLaps();
	updateStats();
}

function renumberLaps() {
	laps
		.sort((a, b) =>
			a.lapTime > b.lapTime ? 1 : b.lapTime > a.lapTime ? -1 : 0,
		)
		.forEach((lap, index) => {
			lap.lapNumber = index; // Start numbering from 0
		});
}

function updateTable() {
	lapBody.innerHTML = ""; // Clear the table

	// Display laps in reverse order
	laps
		.slice()
		.reverse()
		.forEach((lap, index) => {
			const newRow = document.createElement("tr");
			newRow.innerHTML = `
                    <td>${lap.lapNumber}</td>
                    <td>${lap.lapTime.toLocaleTimeString()}</td>
                    <td>${lap.lapDuration.toFixed(2)}</td>
                    <td>
                        <button class="toggleLapButton">Skip</button>
                        <button class="splitLapButton">Split</button>
                    </td>
                `;
			if (!lap.isCounted) {
				newRow.classList.add("not-counted");
				newRow.querySelector(".toggleLapButton").textContent = "Undo";
			}
			lapBody.appendChild(newRow);

			// Add event listener to mark lap as "not counted"
			newRow.querySelector(".toggleLapButton").addEventListener("click", () => {
				toggleLap(lap, newRow, index);
			});

			// Add event listener to split any lap
			newRow.querySelector(".splitLapButton").addEventListener("click", () => {
				splitLap(laps.length - 1 - index); // Pass correct lap index
			});
		});
}

function recalculateLaps(startIndex) {
	let lastValidTime = null;

	// Find the time of the last valid lap before this one
	for (let i = startIndex - 1; i >= 0; i--) {
		if (laps[i].isCounted) {
			lastValidTime = laps[i].lapTime;
			break;
		}
	}

	// Recalculate the "Time Since Last Lap" for subsequent laps
	for (let i = startIndex + 1; i < laps.length; i++) {
		if (laps[i].isCounted) {
			const lapTime = laps[i].lapTime;
			const timeSinceLastLap = lastValidTime
				? (lapTime - lastValidTime) / 1000
				: 0;
			laps[i].lapDuration = timeSinceLastLap;
			lastValidTime = lapTime;
		}
	}

	updateTable();
}

function updateStats() {
	lapCountDisplay.textContent = validLaps;
	const avgLapTime = validLaps > 0 ? (totalLapTime / validLaps).toFixed(2) : 0;
	avgLapTimeDisplay.textContent = avgLapTime;
}

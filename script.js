// Calculate time remaining until launch
function getTimeRemaining(launchDate) {
    const launchTime = new Date(launchDate).getTime();
    const now = new Date().getTime();
    const difference = launchTime - now;

    if (difference <= 0) {
        return {
            total: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
        total: difference,
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
}

// Format countdown for display
function formatCountdown(timeObj) {
    if (timeObj.total <= 0) {
        return "LAUNCHED";
    }

    let parts = [];

    if (timeObj.days > 0) {
        parts.push(`${timeObj.days}d`);
    }
    if (timeObj.hours > 0 || timeObj.days > 0) {
        parts.push(`${timeObj.hours}h`);
    }
    if (timeObj.minutes > 0 || timeObj.hours > 0 || timeObj.days > 0) {
        parts.push(`${timeObj.minutes}m`);
    }
    parts.push(`${timeObj.seconds}s`);

    return parts.join(' ');
}

// Simple fetch from Launch Library 2 API (used by Go4Liftoff) for upcoming rocket launches
async function fetchLaunches() {
  const url = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=15';

//   const lastFetch = localStorage.getItem('lastFetch');
//   if (lastFetch && Date.now() - lastFetch < 3600000) return;
//   localStorage.setItem('lastFetch', Date.now());

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Check for rate limiting
    if (data.detail && data.detail.includes('throttled')) {
      console.error('Rate limited by API. Please wait before making another request.');
      return;
    }
    
    
    if (data.results) {
        const scheduleList = document.getElementById('schedule-list')
        scheduleList.innerHTML = ''

        data.results.forEach(launch => {
        const missionName = launch.mission ? launch.mission.name : 'N/A';
        const rocketName = launch.rocket && launch.rocket.configuration ? launch.rocket.configuration.name : 'N/A';
        const launchDate = launch.net ? new Date(launch.net).toLocaleString() : 'N/A';
        const launchName = launch.name || 'N/A';
        const rocketImage = launch.image || 'N/A';
        const launchDescription = launch.mission ? launch.mission.description : 'N/A';
        const rocketCompany = launch.launch_service_provider ? launch.launch_service_provider.name: 'N/A';



        const card = document.createElement('div');
        card.id = 'schedule-item';

        card.innerHTML += `

        ${rocketImage ? `<img src="${rocketImage}" alt="${launchName}" class="rocket-image">` : ''}
        <div class="info">
            <h2>
                ${launchName}
                </h2>
            <p>
                Company: ${rocketCompany}
            </p>

            <p>
                ${missionName}
            </p>

            <p>
                Rocket Name: ${rocketName}
            </p>
            <p>
            ${launchDescription}
            </p>
            <p>
                Launch Date: ${launchDate}
            </p>
            <p class="countdown" data-launch-time="${launch.net}">
                Calculating countdown...
            </p>
        </div>
        `
        scheduleList.appendChild(card);

      });
    } else {
      console.log('No launch data found.');
    }
  } catch (error) {
    console.error('Error fetching launches:', error);
  }
}

// Update all countdown timers on the page
function updateCountdowns() {
    const countdownElements = document.querySelectorAll('.countdown');

    countdownElements.forEach(element => {
        const launchTime = element.getAttribute('data-launch-time');
        const timeRemaining = getTimeRemaining(launchTime);
        element.textContent = 'T-minus: ' + formatCountdown(timeRemaining);

        if (timeRemaining.total > 0 && timeRemaining.total < 3600000) {
            element.style.color = '#ff4444';
            element.style.fontWeight = 'bold';
        }
    });
}

// Call the function and start countdown timers
fetchLaunches().then(() => {
    updateCountdowns();
    setInterval(updateCountdowns, 1000);
});


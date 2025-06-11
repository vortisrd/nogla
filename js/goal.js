const goal = 20;
let confettiPopped = false;

const streamerBotClient = new StreamerbotClient({
    host: "127.0.0.1",
    port: 8080,
    onConnect: (data) => {
        console.debug( "Streamer.Bot conectado na Webcam Frame" );
        callStreamerBotForSubCount();
    },
    onDisconnect: () => {
        console.debug( "Streamer.Bot desconectado na Webcam Frame" );
    }
});

streamerBotClient.on('General.Custom', (response) => {
    if (response.data.action === 'updateNoglaSubCount') {
        updateSubCount(response.data.args.TwitchSubCount, response.data.args.YouTubeMemberCount);
    }
});

function callStreamerBotForSubCount() {
    streamerBotClient.doAction(
        { name : "Multiplatform Subcount Update" },
    ).then( (stuff) => {
        console.debug('Executando Ação de Update dos Subs no Streamer.Bot', stuff);
    });
}

function updateSubCount(twitch, youtube) {
    var twitchSubs = parseInt(twitch);
    var youtubeSubs = parseInt(youtube);
    var totalSubs = Math.floor(twitchSubs + youtubeSubs);

    if (totalSubs >= goal && confettiPopped == false) {
        confettiPopped = true;
        confettiFireworks();
    }

    
    progressBarAnimate(totalSubs);

    
}



function confettiFireworks() {
    const duration = 10 * 1000,
    animationEnd = Date.now() + duration,
    defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
        return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti(
        Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
    );
    confetti(
        Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
    );
    }, 250);
}




let previousSub = 0;
let animationId = 0;

function progressBarAnimate(totalNewSub) {
    const wrapper = document.querySelector("#nogla-sub-goals .wrapper");
    const goals = wrapper.querySelectorAll(".goal");

    const totalGoals = goals.length;
    const itemsPerMilestone = goal / totalGoals;

    const isIncreasing = totalNewSub >= previousSub;

    const fullMilestones = Math.floor(totalNewSub / itemsPerMilestone);
    const remainder = totalNewSub % itemsPerMilestone;
    const partialProgress = (remainder / itemsPerMilestone) * 100;

    const localAnimationId = ++animationId; // gera ID exclusivo pra esta chamada

    let delay = 0;
    const stepTime = 300;

    const indices = [...Array(totalGoals).keys()];
    const orderedIndices = isIncreasing ? indices : indices.reverse();

    for (let i of orderedIndices) {
        setTimeout(() => {
            if (localAnimationId !== animationId) return; // aborta se outra execução começou

            const goalEl = goals[i];
            let newClass = "incomplete";
            let newWidth = "0%";

            if (i < fullMilestones) {
                newClass = "complete";
                newWidth = "100%";
            } else if (i === fullMilestones && totalNewSub < goal) {
                newClass = "completing";
                newWidth = `${partialProgress}%`;
            }

            const currentClass = goalEl.classList.contains("complete")
                ? "complete"
                : goalEl.classList.contains("completing")
                ? "completing"
                : "incomplete";

            const currentWidth = goalEl.style.getPropertyValue("--progress-width");

            if (currentClass !== newClass || currentWidth !== newWidth) {
                goalEl.classList.remove("complete", "completing", "incomplete");
                goalEl.classList.add(newClass);
                goalEl.style.setProperty("--progress-width", newWidth);
            }
        }, delay);

        delay += stepTime;
    }

    previousSub = totalNewSub; // atualiza para próxima chamada
}




setInterval(() => {
    callStreamerBotForSubCount();
}, 5000);
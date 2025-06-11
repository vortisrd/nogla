const streamerBotClient = new StreamerbotClient({
    host: "127.0.0.1",
    port: 8080,
    onConnect: (data) => {
        console.debug( "Streamer.Bot connected to Webcam Frame" );
        callStreamerBotForSubCount();
    },
    onDisconnect: () => {
        console.debug( "Streamer.Bot disconnected from Webcam Frame" );
    }
});

streamerBotClient.on('General.Custom', (response) => {
    if (response.data.action === 'updateNoglaSubCount') {
        updateSubCount(response.data.args.TwitchSubCount, response.data.args.YouTubeMemberCount);
    }
});

function updateSubCount(twitch, youtube) {
    var twitchSubs = parseInt(twitch);
    var youtubeSubs = parseInt(youtube);

    document.querySelector('.subcount.twitch span').textContent = twitchSubs;
    document.querySelector('.subcount.youtube span').textContent = youtubeSubs;
}

function callStreamerBotForSubCount() {
    streamerBotClient.doAction(
        { name : "Multiplatform Subcount Update" },
    ).then( (stuff) => {
        console.debug('Updating Webcam Frame Subcount from Streamer.Bot', stuff);
    });
}

setInterval(() => {
    callStreamerBotForSubCount();
}, 5000);
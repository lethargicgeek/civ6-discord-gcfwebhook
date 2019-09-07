var request = require('request');

/**
 * Responds to any HTTP request.
 *
 * REQUIRED Express Environment Variables:
 * PLAYER_MAPPING
 *   - This is the mapping between civ names and the discord user id.  Required for proper mentions
 *   Example: { "BobTheBuilder": "394641133033538625",  "Lethargic": "225756082225776768" }
 * DISCORD_WEBHOOK_URL
 *   - The discord webhook to call
 *   Example: https://discordapp.com/api/webhooks/1234556777/Y9RUp_abcdefghijklmnop-fk_plin4AE1kPsDtcwhCw7juFT_HgW
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.civ6WebhookHandler = (req, res) => {
    console.log('Received civ6 message: ' + JSON.stringify(req.body));

    const ip = {
        ip: req.ip,
        ips: req.ips,
        xForwardedForHeader: req.headers['x-forwarded-for'],
        connectionRemoteAddress: req.connection.remoteAddress
    };

    console.log('Received message from IP Addresses: ' + JSON.stringify(ip));

    if (!req.body) {
        console.error("Received an empty body from civ6 :/");
        res.status(400).send('Empty Payload :(');
        return;
    }

    const playerMapping = JSON.parse(process.env.PLAYER_MAPPING);

    // Renaming poorly named civ6 request properties
    const gameName = req.body['value1'];
    const gameTurnNumber = req.body['value3'];
    let playerName = req.body['value2'];

    if (!gameName) {
        console.error(`Received an bogus request body from civ6 :/: ${req.body}`);
        res.status(400).send('Empty Payload :(');
    }

    // Attempt to map to the discord user id for proper mentions
    if (playerMapping[playerName]){
        playerName = `<@${playerMapping[playerName]}>`
    }

    // Creating Discord Payload
    const payload = {
        'content': `Hey ${playerName}, it's time to take your turn #${gameTurnNumber} in ${gameName}!`
    };

    var options = {
        method: 'POST',
        uri:    process.env.DISCORD_WEBHOOK_URL,
        json:    payload,
    };
    request(options, function (error, presp, pbody) {
        if (error) {
            console.error(`Discord error: ${error}`)
        }

        console.log(`Discord response: ${presp}`);
        console.log(`Discord response body: ${pbody}`);
    });

    res.status(200).send('success');
};

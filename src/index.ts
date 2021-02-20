import {createCanvas, Image, loadImage, CanvasRenderingContext2D} from 'canvas';
import * as fs from "fs";
import * as path from "path";
import {IEmote, IEmotePosition, IRect, IMessage} from './MessageTypes'

const testMessage = require('../resources/testMessage.json');

const fontSize = 16;

async function drawTwitchMessage(ctx: CanvasRenderingContext2D, pos: IRect, message: IMessage) {
    //ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    //ctx.fillRect(pos.x, pos.y, pos.width, pos.height);
    ctx.fillStyle = 'rgba(240, 240, 240, 1)';
    let image = await loadImage('./resources/testEmote.png');

    message.messageContent = message.messageContent.split('\n').join(' ');

    const words = message.messageContent.split(' ');
    const wordSpacing = ctx.measureText(" ").width;
    let emotes = testMessage.emotes.sort(((a, b) => a.start - b.start));

    let nextEmote = emotes.shift();

    let index = 0;
    let line = 0;
    let xPos = pos.x;
    for (let i = 0; i < words.length; i++) {
        const wordsWidth = nextEmote.start == index ? fontSize : ctx.measureText(words[i]).width;
        if (xPos + wordsWidth > pos.x + pos.width) {
            line++;
            xPos = pos.x;
        }

        const lineY = pos.y + fontSize + (fontSize * 1.1) * line;

        if (nextEmote.start == index) {



            ctx.drawImage(image, xPos, lineY - fontSize, fontSize, fontSize);
            if (emotes.length) nextEmote = emotes.shift();

            xPos += wordsWidth + wordSpacing;
            index += words[i].length + 1;

            continue;
        }

        console.log(words[i] + ", " + xPos + ", " + lineY);
        ctx.fillText(words[i], xPos, lineY);

        xPos += wordsWidth + wordSpacing;
        index += words[i].length + 1;
    }
}

async function run() {
    const notifBg = await loadImage('./resources/notifBg.png');
    const profile = await loadImage('./resources/47214265.png');
    const canvas = createCanvas(notifBg.width, notifBg.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(notifBg, 0, 0);

    //ctx.font = `${fontSize}pt Lucida Sans Typewriter`;
    ctx.font = `${fontSize}pt Sans`;

    const msgBox: IRect = {
        x: 125,
        y: 120,
        width: 386,
        height: 129
    };

    ctx.fillStyle = 'rgba(200, 200, 200, 1)';
    ctx.font = `26pt Sans`;
    ctx.fillText(testMessage.displayName, 155, 55, 330);
    ctx.font = `${fontSize}pt Sans`;

    ctx.beginPath();
    ctx.arc(64, 64, 55, 0, 2 * Math.PI, false);
    ctx.closePath();

    ctx.save();
    ctx.clip();
    ctx.drawImage(profile, 0, 0, 130, 130);
    ctx.restore();

    drawTwitchMessage(ctx, msgBox, testMessage).then(() => {
        canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'message.png')));
    });
}

run();

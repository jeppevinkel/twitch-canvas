import {createCanvas, Image, loadImage, CanvasRenderingContext2D} from 'canvas';
import * as fs from "fs";
import * as path from "path";
import {IEmote, IEmotePosition, IRect, IMessage} from './MessageTypes'

const testMessage = require('../resources/testMessage.json');

const width = 800;
const height = 400;
const fontSize = 16;

async function drawTwitchMessage(ctx: CanvasRenderingContext2D, pos: IRect, message: IMessage) {
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(pos.x, pos.y, pos.width, pos.height);
    ctx.fillStyle = 'rgba(0, 255, 0, 1)';
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

        const lineY = pos.y + fontSize + (fontSize + pos.y) * line;

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

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

ctx.font = `${fontSize}pt Lucida Sans Typewriter`;

const msgBox: IRect = {
    x: 10,
    y: 10,
    width: canvas.width - 20,
    height: canvas.height - 20
};

drawTwitchMessage(ctx, msgBox, testMessage).then(() => {
    canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'message.png')));
});

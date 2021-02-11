import {createCanvas, Image, loadImage, CanvasRenderingContext2D} from 'canvas';
import * as fs from "fs";
import * as path from "path";
import {IEmote} from './MessageTypes'

const testMessage = require('../resources/testMessage.json');

const width = 800;
const height = 400;
const fontSize = 34;
const padding = 10;

function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

async function drawEmote(ctx: CanvasRenderingContext2D, image: Image, index: number, lineY: number, letterWidth: number) {
    const dx = padding + letterWidth*index;
    const dy = lineY - fontSize/2 - letterWidth/2;

    ctx.drawImage(image, dx, dy, letterWidth, letterWidth);
}

async function drawMessage(message: string) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    message = testMessage.messageContent.split('\n').join(' ');

    ctx.font = `${fontSize}pt Lucida Sans Typewriter`;

    const messageWidth = ctx.measureText(message).width;

    const lines = getLines(ctx, message, canvas.width);

    let image = await loadImage('./resources/testEmote.png');
    let letterWidth: number;
    letterWidth = messageWidth / message.length;

    let indexOffset = 0;
    for (let i = 0; i < lines.length; i++) {
        const lineY = padding + fontSize + (fontSize + padding) * i;
        ctx.fillText(lines[i], padding, lineY);
        //if (lines[i].indexOf('M') != -1) drawEmote(ctx, image, lines[i].indexOf('M'), lineY, letterWidth);

        let index = 0;

        let emotes = testMessage.emotes as IEmote[];

        for (let j = 0; j < emotes.length; j++) {
            let emoteIndex = emotes[j].start - indexOffset;
            if (emoteIndex >= 0 && emoteIndex <= lines[i].length) {
                drawEmote(ctx, image, emoteIndex, lineY, letterWidth);
            }
        }

        // while(index != -1){
        //     index = lines[i].indexOf('M', index);
        //     if (index != -1) {
        //         drawEmote(ctx, image, index, lineY, letterWidth);
        //         index++;
        //     }
        // }

        indexOffset = indexOffset + lines[i].length + 1;
    }




    canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'message.png')));

}

drawMessage("This is a test M perhaps? I guess maybe not? M oh and this line is so long it's probably going to get wrapped! M    RAID!! MMMMMMMM MMMMMM MMM MM M");

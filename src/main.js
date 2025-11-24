const W = 360;
const H = 640;

const config = {
    type: Phaser.AUTO,
    width: W,
    height: H,
    backgroundColor: "#0a0f1e",
    parent: "game",
    physics: { default: "arcade", arcade: { gravity: { y: 900 }, debug: false } },
    scene: {
        preload,
        create,
        update
    }
};

let player;
let obstacle;
let score = 0;
let scoreText;
let best = 0;
let bestText;


function preload() {
    // make tiny square structure
    const g = this.make.graphics({x:0, y:0, add:false});
    g.fillStyle(0xffdf6e, 1);
    g.fillRect(0, 0, 16, 16);
    g.generateTexture("player", 16, 16);
}

function create() {

    // reset score
    score = 0;
    best = Number(localStorage.getItem("tideglide_best") || 0)

    // place player
    player = this.physics.add.sprite(100, 320, "player");
    player.setCollideWorldBounds(true);

    // for flap
    this.input.on("pointerdown", () => {
        player.setVelocityY(-280);
    });
    this.input.keyboard.on("keydown-SPACE", () => {
        player.setVelocityY(-280);
    });

    // title text for confirmation
    this.add.text(12, 12, "Tide Glide", { font: "20px Arial", fill: "#ffffff" });
    this.add.text(12, 36, "Click or Space to rise", { font: "14px Arial", fill: "#bcd" });

    // score text 
    scoreText = this.add.text(W - 20, 12, "0", {
        font: "20px Arial",
        fill: "#ffffff"
    });
    scoreText.setOrigin(1, 0); // align right

    bestText = this.add.text(W - 20, 36, "Best " + best, {
        font: "14px Arial", 
        fill: "#bcd"
    });
    bestText.setOrigin(1, 0);

    // spawn first obstacle
    spawnObstacle(this);

}

// obstacle and collision handling
function spawnObstacle(scene) {
obstacle = scene.physics.add.image(W + 40, H * 0.6, "player");
obstacle.setTint(0x66ccff);
obstacle.setImmovable(true);
obstacle.body.allowGravity = false;
obstacle.setVelocityX(-120);

// collision with player
scene.physics.add.overlap(player, obstacle, onHit, null, scene);

}

function onHit() {

    if (score > best) {
        best = score
        localStorage.setItem("tideglide_best", String(best))
    }
    // restart if hit
    this.scene.restart();
}


function update() {
    // tilt based on speed
    if(!player || !player.body) return;

    const v = player.body.velocity.y;
    player.setAngle(Phaser.Math.Clamp(v * 0.05, -20, 30));

    // count if player passed obstacle
    if (obstacle && obstacle.active && !obstacle.counted && obstacle.x + obstacle.width / 2 < player.x) {
        score += 1;
        scoreText.setText(score);
        obstacle.counted = true; 
    }

    if (score > best) {
        best = score
        bestText.setText("Best " + best)
        localStorage.setItem("tideglide_best", String(best))
    }

    // respawn obstacle once it leaves screen
    if (obstacle && obstacle.active && obstacle.x < -40) {
        obstacle.destroy();
        obstacle = null;
        this.time.delayedCall(800, () => spawnObstacle(this));
    }
}

new Phaser.Game(config);
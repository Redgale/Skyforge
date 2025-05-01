const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let ship;
let cursors;
let islands;
let crystals;
let score = 0;
let scoreText;

function preload() {
  // Placeholder assets — replace with your high-poly renders & sprite sheets
  this.load.image('ship', 'assets/ship.png');
  this.load.image('crystal', 'assets/crystal.png');
  this.load.audio('collect', 'assets/audio/collect.wav');
}

function create() {
  // Background color
  this.cameras.main.setBackgroundColor('#87CEEB');

  // Islands group (as static rectangles for now)
  islands = this.physics.add.staticGroup();
  spawnIsland(this);

  // Crystals
  crystals = this.physics.add.group();
  spawnCrystal(this);

  // Player ship
  ship = this.physics.add.sprite(100, GAME_HEIGHT/2, 'ship').setScale(0.5);
  ship.setCollideWorldBounds(true);

  // Input
  cursors = this.input.keyboard.createCursorKeys();

  // Collisions
  this.physics.add.collider(ship, islands, hitIsland, null, this);
  this.physics.add.overlap(ship, crystals, collectCrystal, null, this);

  // UI
  scoreText = this.add.text(16, 16, 'Crystals: 0', {
    fontSize: '24px', fill: '#fff'
  });

  // Audio
  this.collectSound = this.sound.add('collect');
}

function update(time, delta) {
  // Ship control
  ship.setVelocity(0);
  if (cursors.up.isDown)    ship.setVelocityY(-200);
  if (cursors.down.isDown)  ship.setVelocityY(200);
  if (cursors.left.isDown)  ship.setVelocityX(-200);
  if (cursors.right.isDown) ship.setVelocityX(200);

  // Scroll islands + crystals left
  islands.getChildren().forEach(isle => {
    isle.x -= 2;
    isle.refreshBody();
    if (isle.x < -100) {
      // remove off-screen and spawn new
      isle.destroy();
      spawnIsland(this);
    }
  });

  crystals.getChildren().forEach(cr => {
    cr.x -= 2;
    if (cr.x < -50) {
      cr.destroy();
      spawnCrystal(this);
    }
  });
}

// Helpers

function spawnIsland(scene) {
  const width  = Phaser.Math.Between(100, 300);
  const height = Phaser.Math.Between(20, 60);
  const x = GAME_WIDTH + width/2;
  const y = Phaser.Math.Between(200, GAME_HEIGHT-100);
  const isle = scene.add.rectangle(x, y, width, height, 0x8B4513);
  scene.physics.add.existing(isle, true);
  islands.add(isle);
}

function spawnCrystal(scene) {
  const x = GAME_WIDTH + Phaser.Math.Between(50, 400);
  const y = Phaser.Math.Between(50, GAME_HEIGHT-50);
  const cr = crystals.create(x, y, 'crystal').setScale(0.3).refreshBody();
  cr.body.setAllowGravity(false);
}

function hitIsland(ship, isle) {
  // TODO: handle damage/death, play explosion VFX
  this.scene.pause();
  scene.add.text(GAME_WIDTH/2 - 80, GAME_HEIGHT/2, 'Game Over', {
    fontSize: '48px', fill: '#ff0000'
  });
}

function collectCrystal(ship, crystal) {
  crystal.destroy();
  score += 1;
  scoreText.setText('Crystals: ' + score);
  this.collectSound.play();
}

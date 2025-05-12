let spaghay: Sprite = null
let salti = 0
let canShoot = false
let shootTimer = 0

scene.setBackgroundColor(4)
tiles.setCurrentTilemap(tilemap`livello1`)

// Giocatore
spaghay = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . 2 2 2 2 2 2 2 2 . . 
    . . . . 2 2 2 4 4 4 4 4 4 2 . . 
    . . . . 2 4 4 4 4 1 1 1 4 2 . . 
    . . . . 2 4 4 4 4 1 1 f 4 2 . . 
    . . . 2 2 4 4 4 4 1 1 1 4 2 2 2 
    . . 2 2 4 4 4 4 4 4 4 4 4 4 4 2 
    2 2 2 4 4 4 4 4 4 4 4 4 4 4 4 2 
    2 4 4 4 4 4 4 4 4 4 4 4 4 4 4 2 
    2 4 4 4 4 4 4 4 4 4 4 4 4 4 2 2 
    2 4 4 4 2 4 4 4 4 4 4 4 4 2 2 . 
    2 4 4 4 2 2 4 4 4 4 4 2 2 2 . . 
    2 4 4 4 2 4 4 4 4 2 2 2 . . . . 
    2 4 4 4 4 4 4 2 2 2 . . . . . . 
    2 4 4 4 4 4 2 2 . . . . . . . . 
    2 2 2 2 2 2 2 . . . . . . . . . 
`, SpriteKind.Player)

controller.moveSprite(spaghay, 100, 0)
scene.cameraFollowSprite(spaghay)

// Salto e doppio salto
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (salti < 2) {
        spaghay.vy = -200
        salti++
    }
})

game.onUpdate(function () {
    spaghay.ay = 980
    if (spaghay.isHittingTile(CollisionDirection.Bottom)) {
        salti = 0
    }
})

// Eventi su tile
scene.onOverlapTile(SpriteKind.Player, assets.tile`miaTessera1`, function (sprite, location) {
    game.gameOver(true)
})
scene.onOverlapTile(SpriteKind.Player, assets.tile`miaTessera0`, function (sprite, location) {
    game.gameOver(false)
})
scene.onOverlapTile(SpriteKind.Player, assets.tile`miaTessera2`, function (sprite, location) {
    spaghay.setPosition(742, 20)
})

// Power-up
let powerUp = sprites.create(img`
    . . . . . . . 
    . . 6 6 6 6 . 
    . 6 9 9 9 6 . 
    . 6 9 6 9 6 . 
    . 6 9 9 9 6 . 
    . . 6 6 6 . . 
    . . . . . . . 
`, SpriteKind.Food)
powerUp.setPosition(200, 50)

sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, power) {
    power.destroy()
    canShoot = true
    shootTimer = game.runtime()
})

// Sparo automatico ogni 1 secondo
game.onUpdate(function () {
    if (canShoot && game.runtime() - shootTimer > 1000) {
        shootTimer = game.runtime()
        let caramella = sprites.createProjectileFromSprite(img`
            . . . . . 
            . 5 2 5 . 
            . 2 5 2 . 
            . 5 2 5 . 
            . . . . . 
        `, spaghay, 100, 0)
        caramella.lifespan = 1000
        caramella.setKind(SpriteKind.Projectile)
    }
})

// Nemico
let nemico = sprites.create(img`
    . . . . . c c c c . . . . . 
    . . . c c 5 5 5 5 c c . . . 
    . . c 5 5 5 5 5 5 5 5 c . . 
    . c 5 5 5 5 5 5 5 5 5 5 c . 
    . c 5 5 f 5 5 5 5 f 5 5 c . 
    . c 5 5 5 5 5 5 5 5 5 5 c . 
    c 5 5 5 5 5 5 5 5 5 5 5 5 c 
    c 5 5 5 5 5 5 5 5 5 5 5 5 c 
    c 5 5 5 5 5 5 5 5 5 5 5 5 c 
    . c 5 5 5 5 5 5 5 5 5 5 c . 
    . c 5 5 5 5 5 5 5 5 5 5 c . 
    . . c 5 5 5 5 5 5 5 5 c . . 
    . . . c c 5 5 5 5 c c . . . 
    . . . . . c c c c . . . . . 
`, SpriteKind.Enemy)

nemico.setPosition(400, 100)
nemico.ay = 980
nemico.setDataNumber("caramelleMangiate", 0)

game.onUpdateInterval(100, function () {
    if (nemico && nemico.vy == 0) {
        if (nemico.x > spaghay.x) {
            nemico.vx = -40
        } else {
            nemico.vx = 40
        }
    }
})

// Collisione: player e nemico
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (player, enemy) {
    if (player.vy > 0 && player.y < enemy.y) {
        let extra = enemy.data.getNumber("caramelleMangiate")
        let totalPoints = 10 + (extra * 10)
        info.changeScoreBy(totalPoints)
        enemy.destroy()
        player.vy = -100
    } else {
        game.over(false)
    }
})

// Caramella colpisce nemico
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (proj, enemy) {
    proj.destroy()
    let count = enemy.data.getNumber("caramelleMangiate") || 0
    enemy.setDataNumber("caramelleMangiate", count + 1)
    enemy.setImage(img`
        . . . . . . . c c c c . . . . . . . 
        . . . . . c c 5 5 5 5 c c . . . . . 
        . . . . c 5 5 5 5 5 5 5 5 c . . . . 
        . . . c 5 5 5 5 5 5 5 5 5 5 c . . . 
        . . . c 5 5 f 5 5 5 5 f 5 5 c . . . 
        . . . c 5 5 5 5 5 5 5 5 5 5 c . . . 
        . . c 5 5 5 5 5 5 5 5 5 5 5 5 c . . 
        . . c 5 5 5 5 5 5 5 5 5 5 5 5 c . . 
        . . c 5 5 5 5 5 5 5 5 5 5 5 5 c . . 
        . . . c 5 5 5 5 5 5 5 5 5 5 c . . . 
        . . . c 5 5 5 5 5 5 5 5 5 5 c . . . 
        . . . . c 5 5 5 5 5 5 5 5 c . . . . 
        . . . . . c c 5 5 5 5 c c . . . . . 
        . . . . . . . c c c c . . . . . . . 
    `)
})
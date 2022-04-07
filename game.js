kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0,0,0,1]
})

const MOVE_SPEED = 120

loadRoot('https://i.imgur.com/')
loadSprite('link-going-left', 'ghkOvVs.png')
loadSprite('link-going-right', 'IC5qvUd.png')
loadSprite('link-going-down', 'NZlbYsO.png')
loadSprite('link-going-up', 'Z5ywqAZ.png')
loadSprite('left-wall', 'oUU5cLD.png')
loadSprite('top-wall', 'xAtyaVj.png')
loadSprite('bottom-wall', 'HjGSTNl.png')
loadSprite('right-wall', 'mHTRo8P.png')
loadSprite('bottom-left-wall', 'lUcMtzn.png')
loadSprite('bottom-right-wall', 'ftkfK9h.png')
loadSprite('top-left-wall', 'MyPpOd6.png')
loadSprite('top-right-wall', 'dL0mvAp.jpg')
loadSprite('top-door', 'ht5wxBY.png')
loadSprite('fire-pot', 'AlK5rFn.png')
loadSprite('left-door', 'yWwLeWZ.png')
loadSprite('lanterns', '9UmIfwy.png')
loadSprite('slicer', 'nvR8KBk.png')
loadSprite('skeletor', '2ORHMu6.png')
loadSprite('kaboom', 'XJy4xTG.png')
loadSprite('stairs', 'Z1cEFAJ.png')
loadSprite('bg', 'auLUWR1.png')

scene("game", ({ level, score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    const maps = [
        [
            'gccnccjcce',
            'a        b',
            'a      l b',
            'a    o   b',
            'i        b',
            'a    o   b',
            'a   l    b',
            'a        b',
            'fddnddnddh',
        ],
        [
            'gcccccccce',
            'a        b',
            'n        n',
            'a        b',
            'i        b',
            'a    k   b',
            'n   m    n',
            'a        b',
            'fddddddddh',
        ],
        [
            'gcccccccce',
            'a        b',
            'n   m    n',
            'a        b',
            'i        b',
            'a    k   b',
            'n   m    n',
            'a        b',
            'fddddddddh',
        ],

    ]

    const levelCfg = {
        width: 48,
        height: 48,
        'a': [sprite('left-wall'), solid(), 'wall'],
        'b': [sprite('right-wall'), solid(), 'wall'],
        'c': [sprite('top-wall'), solid(), 'wall'],
        'd': [sprite('bottom-wall'), solid(), 'wall'],
        'e': [sprite('top-right-wall'), solid(), 'wall'],
        'f': [sprite('bottom-left-wall'), solid(), 'wall'],
        'g': [sprite('top-left-wall'), solid(), 'wall'],
        'h': [sprite('bottom-right-wall'), solid(), 'wall'],
        'i': [sprite('left-door'), solid(),],
        'j': [sprite('top-door'), 'next-level',],
        'k': [sprite('stairs'), 'next-level'],
        'l': [sprite('slicer'), 'slicer', { dir: -1 }, 'dangerous'],
        'm': [sprite('skeletor'), 'dangerous', 'skeletor', { dir: -1, timer: 0 }],
        'n': [sprite('lanterns'), solid()],
        'o': [sprite('fire-pot'), solid()],

    }
    addLevel(maps[level], levelCfg)

    add([sprite('bg'), layer('bg')])

    const scoreLabel = add([
        text('0'),
        pos(400, 450),
        layer('ui'),
        {
            value: score,
        },
        scale(2),
    ])

    add([text('level: ' + parseInt(level + 1)), pos(400, 485), scale(2)])

    const player = add([
        sprite('link-going-right'),
        pos(5, 190),
        {   // Link moving right by default
            dir: vec2(1, 0)
        }
    ])

    player.action(() => {
        player.resolve()
    })

    player.overlaps('next-level', () => {
        go("game", {
            level: (level + 1) % maps.length,
            score: scoreLabel.value
        })
    })

    keyDown('left', () => {
        player.changeSprite('link-going-left')
        player.move(-MOVE_SPEED, 0)
        player.dir = vec2(-1, 0)
    })

    keyDown('right', () => {
        player.changeSprite('link-going-right')
        player.move(MOVE_SPEED, 0)
        player.dir = vec2(1, 0)
    })

    keyDown('up', () => {
        player.changeSprite('link-going-up')
        player.move(0, -MOVE_SPEED)
        player.dir = vec2(0, -1)
    })

    keyDown('down', () => {
        player.changeSprite('link-going-down')
        player.move(0, MOVE_SPEED)
        player.dir = vec2(0, 1)
    })

    function spawnKaboom(p) {
        const obj = add([sprite('kaboom'), pos(p), 'kaboom'])
        wait(1, () => {
            destroy(obj)
        })
    }

    keyPress('space', () => {
        spawnKaboom(player.pos.add(player.dir.scale(48)))
    })

    // player.collides('door', (d) => {
    //     destroy(d)
    // })

    collides('kaboom', 'skeletor', (k , s) => {
        camShake(4)
        wait(1, () => {
            destroy(k)
        })
        destroy(s)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
    })

    const SLICER_SPEED = 200

    action('slicer', (s) => {
        s.move(s.dir * SLICER_SPEED, 0)
    })

    collides('slicer', 'wall', (s) => {
        s.dir = -s.dir
    })

    const SKELETOR_SPEED = 120

    action('skeletor', (s) => {
        s.move(0, s.dir * SKELETOR_SPEED)
        s.timer -= dt()
        if (s.timer <= 0) {
            s.dir = - s.dir
            s.timer = rand(5)
        }
    })

    collides('skeletor', 'wall', (s) => {
        s.dir = -s.dir
    })

    player.overlaps('dangerous', () => {
        go('lose', { score: scoreLabel.value})
    })
})

scene("lose", ({ score }) => {
    add([text(score, 32), origin('center'), pos(width()/ 2, height() /2)])
})

start("game", { level: 0, score: 0 })
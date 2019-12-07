# pixi-spine-debug

As an extension of pixi-spine, it has the same complete drawDebug as the official spine-runtimes of EsotericSoftware.

Thanks [@ivanpopelyshev](https://github.com/ivanpopelyshev) for the help


# use

Introduce `pixi.js`, `pixi-spine.js`, `pixi-spine-debug.js` in order on the page (note the order of dependencies)

```javascript
const app = new PIXI.Application();
PIXI.loader.add('demo','spine-pro.json').load((loader,res)=>{
    let demo = new PIXI.spine.Spine(res.demo.spineData);
    demo.state.setAnimation(0,'animatename',true);
    demo.x = demo.y = 200;

    // Enable drawdebug，Default is false
    demo.drawDebug = true;
    demo.drawBones = true;
    demo.drawRegionAttachments = true;
    demo.drawClipping = true;
    demo.drawMeshHull = true;
    demo.drawMeshTriangles = true;
    demo.drawPaths = true;
    demo.drawBoundingBoxes = true;

    app.stage.addChild(demo);
});

document.body.appendChild(app.view);
```

# Demo

[pixi-spine-debug demo](https://sbfkcel.github.io/pixi-spine-debug)


# License

MIT

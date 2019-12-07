const app = new PIXI.Application({
    backgroundColor:0xFFFFFF,
    antialias:true,
    width:800,
    height:600
});

document.getElementById('app').appendChild(app.view);

let loader = PIXI.loader.add('spineboy','./assets/spine/spineboy-pro.json');

loader.add('vine','./assets/spine/vine-pro.json')

loader.load((loader,res)=>{
    let spineboy = new PIXI.spine.Spine(res.spineboy.spineData),
        vine = new PIXI.spine.Spine(res.vine.spineData),
        options = [''];
    // spineboy
    spineboy.scale.set(0.4);
    spineboy.state.setAnimation(0,'portal',true);
    spineboy.x = 400;
    spineboy.y = 480;
    spineboy.drawDebug = true;

    // vine
    vine.scale.set(0.4);
    vine.state.setAnimation(0,'grow',true);
    vine.x = 700;
    vine.y = 480;
    vine.drawDebug = true;

    app.stage.addChild(spineboy);
    app.stage.addChild(vine);

    // debug ui
    let spineboyCheckboxs = document.getElementsByName('spineboy'),
        vineCehckboxs = document.getElementsByName('vine'),
        debugOptions = ['drawBones','drawRegionAttachments','drawClipping','drawMeshHull','drawMeshTriangles','drawPaths','drawBoundingBoxes'],
        setDebug = function(index){
            let name = this.name,
                spine = name === 'spineboy' ? spineboy : name === 'vine' ? vine : undefined;
            if(!spine){return;};
            spine[debugOptions[index]] = this.checked;
        },
        fn = (item,index) => {
            setDebug.call(item,index);
            let label = item.nextElementSibling;
            if(label.tagName === 'LABEL'){
                label.innerHTML = debugOptions[index];
            };
            item.onchange = function(){
                setDebug.call(this,index);
            };
        };
    
    spineboyCheckboxs.forEach(fn);
    vineCehckboxs.forEach(fn);
});
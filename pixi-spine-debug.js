((PIXI)=>{
    PIXI = PIXI || window.PIXI;
    if(PIXI && PIXI.spine && PIXI.spine.Spine){
        const Spine = PIXI.spine.Spine,
            oldUpadte = Spine.prototype.update,
            list = [
                'bonesLine','bonesDots',                                            // 骨骼
                'regionAttachmentsShape',                                           // 区块
                'meshTrianglesLine','meshHullLine',                                 // 蒙皮
                'clippingPolygon',                                                  // 蒙版
                'boundingBoxesRect','boundingBoxesCircle','boundingBoxesPolygon',   // 边界框
                'pathsCurve','pathsLine'                                            // 路径
            ],
            ghs = {},
            debugGroup = new PIXI.Container();
        
        let lineWidth,
            drawDebug = function(){
                if(!this.drawDebug){return;};
                if(!this.addDebugContainer){
                    lineWidth = 1 / (this.scale.x || this.scale.y || 1);
                    // 创建图形，并添加到debug容器
                    for(let i=0,len=list.length; i<len; i++){
                        let name = list[i];
                        ghs[name] = new PIXI.Graphics();
                        debugGroup.addChild(ghs[name]);
                    };
                    this.addChild(debugGroup);
                    this.addDebugContainer = true;
                };       
    
                const bones = this.skeleton.bones,
                    slots = this.skeleton.slots,
                    skeletonX = this.skeleton.x,
                    skeletonY = this.skeleton.y;
    
                // 绘制骨骼
                if(this.drawBones){
                    ghs.bonesLine.clear();
                    ghs.bonesLine.lineStyle(lineWidth, 0xFF0000, 1);
                    ghs.bonesDots.clear();
    
                    for(let i=0,len=bones.length; i<len; i++){
                        let bone = bones[i],
                            boneLen = bone.data.length,
                            starX = skeletonX + bone.worldX,
                            starY = skeletonY + bone.worldY,
                            endX = skeletonX + boneLen * bone.matrix.a + bone.worldX,
                            endY = skeletonY + boneLen * bone.matrix.b + bone.worldY,
                            dotSize = lineWidth * 2;
    
                        if(bone.data.name === 'root' || bone.parent === null){continue;};
    
                        // 绘制骨骼线条
                        ghs.bonesLine.moveTo(starX,starY);
                        ghs.bonesLine.lineTo(endX,endY);
    
                        // 绘制骨骼点
                        ghs.bonesDots.beginFill(0x00FF00,1);
                        ghs.bonesDots.drawCircle(starX,starY,dotSize);
                        ghs.bonesDots.endFill();
                    };
    
                    // 绘制骨架起点『X』形式
                    let startDotSize = lineWidth * 3;
                    ghs.bonesLine.moveTo(skeletonX - startDotSize,skeletonY - startDotSize);
                    ghs.bonesLine.lineTo(skeletonX + startDotSize,skeletonY + startDotSize);
                    ghs.bonesLine.moveTo(skeletonX + startDotSize,skeletonY - startDotSize);
                    ghs.bonesLine.lineTo(skeletonX - startDotSize,skeletonY + startDotSize);
                };
    
                // 绘制区块附件
                if(this.drawRegionAttachments){
                    ghs.regionAttachmentsShape.clear();
                    ghs.regionAttachmentsShape.lineStyle(lineWidth,0x0078FF,1);
    
                    for(let i=0,len=slots.length; i<len; i++){
                        let slot = slots[i],
                            attachment = slot.getAttachment();
                        if(!(attachment instanceof PIXI.spine.core.RegionAttachment)){continue;};
    
                        let vertices = new Float32Array(8);
                        attachment.updateOffset();
                        attachment.computeWorldVertices(slot.bone,vertices,0,2);
                        ghs.regionAttachmentsShape.drawPolygon([...vertices.slice(0,8)]);
                        // ghs.regionAttachmentsShape.moveTo(vertices[0],vertices[1]);
                        // ghs.regionAttachmentsShape.lineTo(vertices[2],vertices[3]);
                        // ghs.regionAttachmentsShape.lineTo(vertices[4],vertices[5]);
                        // ghs.regionAttachmentsShape.lineTo(vertices[6],vertices[7]);
                        // ghs.regionAttachmentsShape.lineTo(vertices[0],vertices[1]);
                    };
                };
    
                // 绘制蒙皮
                if(this.drawMeshHull || this.drawMeshTriangles){
                    ghs.meshHullLine.clear();
                    ghs.meshHullLine.lineStyle(lineWidth,0x0078FF,1);
                    ghs.meshTrianglesLine.clear();
                    ghs.meshTrianglesLine.lineStyle(lineWidth,0xFFCC00,1);
    
                    for(let i=0,len=slots.length; i<len; i++){
                        let slot = slots[i];
                        if(!slot.bone.active){continue;};
                        let attachment = slot.getAttachment();
                        if(!(attachment instanceof PIXI.spine.core.MeshAttachment)){continue;};
    
                        let vertices = new Float32Array(attachment.vertices.length),
                            triangles = attachment.triangles,
                            hullLength = attachment.hullLength;
                        attachment.computeWorldVertices(slot, 0, attachment.worldVerticesLength, vertices, 0, 2);
                        // 画蒙皮网格（三角形）
                        if(this.drawMeshTriangles){
                            for(let _i=0,_len=triangles.length; _i<_len; _i+=3){
                                let v1 = triangles[_i] * 2,
                                    v2 = triangles[_i + 1] * 2,
                                    v3 = triangles[_i + 2] * 2;
                                ghs.meshTrianglesLine.moveTo(vertices[v1],vertices[v1 + 1]);
                                ghs.meshTrianglesLine.lineTo(vertices[v2],vertices[v2 + 1]);
                                ghs.meshTrianglesLine.lineTo(vertices[v3],vertices[v3 + 1]);
                            };
                        };
    
                        // 画蒙皮边框
                        if(this.drawMeshHull && hullLength > 0){
                            hullLength = (hullLength >> 1) * 2;
                            let lastX = vertices[hullLength - 2],
                                lastY = vertices[hullLength - 1];
                            for(let _i=0,_len=hullLength; _i<_len; _i+=2){
                                let x = vertices[_i],
                                    y = vertices[_i + 1];
                                ghs.meshHullLine.moveTo(x,y);
                                ghs.meshHullLine.lineTo(lastX,lastY);
                                lastX = x;
                                lastY = y;
                            };
                        };
                    };
                };
    
                // 蒙版区域
                if(this.drawClipping){
                    ghs.clippingPolygon.clear();
                    ghs.clippingPolygon.lineStyle(lineWidth,0xFF00FF,1);
                    for(let i=0,len=slots.length; i<len; i++){
                        let slot = slots[i];
                        if(!slot.bone.active){continue;};
                        let attachment = slot.getAttachment();
                        if(!(attachment instanceof PIXI.spine.core.ClippingAttachment)){continue;};
    
                        let nn = attachment.worldVerticesLength,
                            world = new Float32Array(nn);
                        attachment.computeWorldVertices(slot, 0, nn, world, 0, 2);
                        ghs.clippingPolygon.drawPolygon([...world]);
                    };
                };
    
                // 绘制边界框
                if(this.drawBoundingBoxes){
                    ghs.boundingBoxesRect.clear();
                    ghs.boundingBoxesRect.lineStyle(lineWidth,0x00FF00,1);
    
                    ghs.boundingBoxesPolygon.clear();
                    ghs.boundingBoxesPolygon.lineStyle(lineWidth,0x00FF00,0.5);
                    ghs.boundingBoxesPolygon.beginFill(0x00FF00,0.1);
    
                    ghs.boundingBoxesCircle.clear();
                    ghs.boundingBoxesCircle.lineStyle(0);
                    ghs.boundingBoxesCircle.beginFill(0x00DD00);
    
                    let bounds = new PIXI.spine.core.SkeletonBounds();
                    bounds.update(this.skeleton, true);
                    ghs.boundingBoxesRect.drawRect(bounds.minX, bounds.minY, bounds.getWidth(), bounds.getHeight());
    
                    let polygons = bounds.polygons,
                        drawPolygon = (polygonVertices,offset,count)=>{
                            if(count < 3){
                                throw new Error('Polygon must contain at least 3 vertices');
                            };
                            let paths = [],
                                dotSize = lineWidth * 2;
                            for(let i=0,len=polygonVertices.length; i<len; i+=4){
                                let x1 = polygonVertices[i],
                                    y1 = polygonVertices[i+1],
                                    x2 = polygonVertices[i+2],
                                    y2 = polygonVertices[i+3];
                                if(i < len){
                                    ghs.boundingBoxesCircle.drawCircle(x1,y1,dotSize);
                                    ghs.boundingBoxesCircle.drawCircle(x2,y2,dotSize);
                                };
                                paths.push(x1,y1,x2,y2);
                            };
                            ghs.boundingBoxesPolygon.drawPolygon(paths);
                            ghs.boundingBoxesPolygon.endFill();
                            ghs.boundingBoxesCircle.endFill();
                        };
                    for(let i=0,len=polygons.length; i<len; i++){
                        let polygon = polygons[i];
                        drawPolygon(polygon,0,polygon.length);
                    };
                };
    
                // 绘制路径
                if(this.drawPaths){
                    ghs.pathsCurve.clear();
                    ghs.pathsCurve.lineStyle(lineWidth,0xFF0000,1);
    
                    ghs.pathsLine.clear();
                    ghs.pathsLine.lineStyle(lineWidth * 2,0x00FFFF,1);
    
                    for(let i=0,len=slots.length; i<len; i++){
                        let slot = slots[i];
                        if (!slot.bone.active){continue;};
                        let attachment = slot.getAttachment();
                        if(attachment instanceof PIXI.spine.core.PathAttachment){
                            let nn = attachment.worldVerticesLength,
                                world = new Float32Array(nn);
                            attachment.computeWorldVertices(slot, 0, nn, world, 0, 2);
                            let x1 = world[2],
                                y1 = world[3],
                                x2 = 0,
                                y2 = 0;
                            if(attachment.closed){
                                let cx1 = world[0],
                                    cy1 = world[1],
                                    cx2 = world[nn - 2],
                                    cy2 = world[nn - 1];
                                x2 = world[nn - 4];
                                y2 = world[nn - 3];
    
                                // 曲线
                                ghs.pathsCurve.moveTo(x1,y1);
                                ghs.pathsCurve.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    
                                // 句柄
                                ghs.pathsLine.moveTo(x1,y1);
                                ghs.pathsLine.lineTo(cx1,cy1);
                                ghs.pathsLine.moveTo(x2,y2);
                                ghs.pathsLine.lineTo(cx2,cy2);
                            };
                            nn -= 4;
                            for (var ii = 4; ii < nn; ii += 6) {
                                var cx1 = world[ii], cy1 = world[ii + 1], cx2 = world[ii + 2], cy2 = world[ii + 3];
                                x2 = world[ii + 4];
                                y2 = world[ii + 5];
                                // 曲线
                                ghs.pathsCurve.moveTo(x1,y1);
                                ghs.pathsCurve.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    
                                // 句柄
                                ghs.pathsLine.moveTo(x1,y1);
                                ghs.pathsLine.lineTo(cx1,cy1);
                                ghs.pathsLine.moveTo(x2,y2);
                                ghs.pathsLine.lineTo(cx2,cy2);
                                x1 = x2;
                                y1 = y2;
                            }
                        };
                                
                    };
                };
            };
    
        Spine.prototype.updateMyDebugGraphics = drawDebug;
        Spine.prototype.update = function(dt){
            oldUpadte.call(this,dt);
            this.updateMyDebugGraphics();
        };
    };
})(PIXI);
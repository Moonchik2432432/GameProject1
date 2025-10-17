
function interact(e){
    Attack(e.npc);
}

function Attack(npc) {
    var Thread = Java.type("java.lang.Thread");
    var HThread = Java.extend(Thread, {
        run: function() {
            var nbt = npc.getEntityNbt();
            nbt.setByte("PuppetStanding", 1);
            nbt.setByte("PuppetAttacking", 1);
            nbt.setByte("PuppetMoving", 1);
            nbt.getCompound("PuppetRArm").setByte("Disabled", 0);
            nbt.getCompound("PuppetLArm").setByte("Disabled", 0);
            npc.setEntityNbt(nbt);
            
              
            var armAngleX = 180;
            var armAngleY = 180;
            var armAngleZ = 180;  
            var lArmAngleZ = 180;  
            //поднятие оружие
            for (var i = 0; i < 6; ++i) {
               armAngleX -= 21;
               armAngleY += 3;
               armAngleZ -= 6;
               lArmAngleZ -= 4;
                
                npc.job.getPart(2).setRotation(armAngleX, armAngleY, armAngleZ); //65, 195, 145
                npc.job.getPart(1).setRotation(180,180,lArmAngleZ)
                npc.updateClient();
                Thread.sleep(60);
            }
            //удар
          for(var j = 0; j  < 2; ++j) {
            var h = (j % 2 == 0) ? 30 : -30;
                for (var i = 0; i < 4; ++i) {
                    armAngleX += h;
                    npc.job.getPart(2).setRotation(armAngleX, 195, 145);  //145
                    npc.updateClient();
                   Thread.sleep(50);
                    }
            }

            nbt.setByte("PuppetStanding", 0);
            nbt.setByte("PuppetAttacking", 0);
            nbt.setByte("PuppetMoving", 0);
            nbt.getCompound("PuppetRArm").setByte("Disabled", 1);
            nbt.getCompound("PuppetLArm").setByte("Disabled", 1);
            npc.setEntityNbt(nbt);
        }
    });
    
    var H = new HThread();
    H.start();
}




/*
var rpgPlayer;
function getRPGPlayer(player) {
    var tempData = player.getTempdata()
    if(tempData.has("rpgPlayer") == false ) {
        tempData.put("rpgPlayer",createRPGPlayer(player))
    }
    return tempData.get("rpgPlayer");
}

function createRPGPlayer(player) {  
    var storedData = player.getStoreddata() 
    return {
        player: player,
        lvl: (storedData.has("lvl"))?storedData.get("lvl"):0,
        xp: (storedData.has("xp"))?storedData.get("xp"):0,
        needXp: (storedData.has("needXp"))?storedData.get("needXp"):0,
        startHp: 10,
        hpPerLevel: 1,
        giveXp: function(count) {
            this.xp += count;
            this.player.message("Получен "+count+" опыта " +this.xp+"/"+this.needXp)
            if(this.xp >= this.needXp) {
                this.lvl++;
                this.player.message("Вы получили "+this.lvl+" уровень! Чтобы получить следующий уровень, нужно набрать " +this.needXp+ " опыта")
                this.xp -= this.needXp;
                this.needXp = this.lvl*500;
                this.updateStats();
            }
        },
        updateStats: function() {
               this.player.setMaxHealth(this.startHp + this.hpPerLevel * this.lvl);
              },
              save: function() {
                  var storedData = this.player.getStoreddata();
                  storedData.put("lvl", this.lvl);
                  storedData.put("xp", this.xp);
                  storedData.put("needXp", this.needXp);
              }
    }
}

function logout(e) {
    rpgPlayer.save();
}

function kill(e) {
    var player = e.player;
    var entity = e.entity;
    if(entity.getType() == 2) {
        rpgPlayer.giveXp(50);
    }
}

function init(e) {
    var player = e.player;
    rpgPlayer = getRPGPlayer(player);
    rpgPlayer.updateStats();
}
*/


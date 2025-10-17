package net.mcreator.weaponadventure.events;

import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.api.distmarker.Dist;
import net.minecraftforge.api.distmarker.OnlyIn;
import net.minecraftforge.event.TickEvent;

import net.minecraft.client.Minecraft;
import net.minecraft.client.audio.ISound;
import net.minecraft.client.audio.SimpleSound;
import net.minecraft.util.ResourceLocation;
import net.minecraft.util.SoundEvent;
import net.minecraft.entity.LivingEntity;
import net.minecraft.entity.boss.WitherEntity;
import net.minecraft.entity.boss.dragon.EnderDragonEntity;

@Mod.EventBusSubscriber
public class Bosshitmusic {

    private static final double MUSIC_RADIUS = 30.0;
    private static ISound currentSound = null;

    private static final SoundEvent BOSS_MUSIC = new SoundEvent(new ResourceLocation("weapon_adventure", "dedmaksim"));

    @OnlyIn(Dist.CLIENT)
    @SubscribeEvent
    public static void onClientTick(TickEvent.ClientTickEvent event) {
        Minecraft mc = Minecraft.getInstance();
        if (mc.player == null || mc.world == null) return;

        boolean bossNearby = false;

        for (LivingEntity entity : mc.world.getEntitiesWithinAABB(LivingEntity.class, mc.player.getBoundingBox().grow(MUSIC_RADIUS))) {
            if (entity instanceof EnderDragonEntity || entity instanceof WitherEntity) {
                bossNearby = true;
                break;
            }
        }

        if (bossNearby && currentSound == null) {
            // Проигрываем музыку
            currentSound = SimpleSound.music(BOSS_MUSIC);
            mc.getSoundHandler().play(currentSound);
        } else if (!bossNearby && currentSound != null) {
            // Останавливаем музыку
            mc.getSoundHandler().stop(currentSound);
            currentSound = null;
        }
    }
}

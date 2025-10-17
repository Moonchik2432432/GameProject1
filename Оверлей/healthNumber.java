package net.mcreator.weaponadventure.gui.overlay;

import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.eventbus.api.EventPriority;
import net.minecraftforge.client.event.RenderGameOverlayEvent;
import net.minecraftforge.api.distmarker.OnlyIn;
import net.minecraftforge.api.distmarker.Dist;

import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.client.Minecraft;

@Mod.EventBusSubscriber
public class HealthTrackerOverlay {
	@OnlyIn(Dist.CLIENT)
	@SubscribeEvent(priority = EventPriority.HIGH)
	public static void eventHandler(RenderGameOverlayEvent.Post event) {
		if (event.getType() == RenderGameOverlayEvent.ElementType.HELMET) {
			PlayerEntity entity = Minecraft.getInstance().player;
			if (entity == null) return;

			// Получаем значения из NBT
			double currentHealth = entity.getPersistentData().getDouble("health_tracker_nbt");
			double maxHealth = entity.getPersistentData().getDouble("healthMax_tracker_nbt");

			// Координаты в левом верхнем углу
			int x = 20;
			int y = 10;

			// Цвет текста: белый
			int color = 0xFFFFFF;

			// Отрисовка
			Minecraft.getInstance().fontRenderer.drawString(
				event.getMatrixStack(),
				currentHealth + " / " + maxHealth,
				x, y, color
			);
		}
	}
}

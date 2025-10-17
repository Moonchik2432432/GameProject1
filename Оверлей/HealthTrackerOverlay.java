package net.mcreator.weaponadventure.gui.overlay;

import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.eventbus.api.EventPriority;
import net.minecraftforge.client.event.RenderGameOverlayEvent;
import net.minecraftforge.api.distmarker.OnlyIn;
import net.minecraftforge.api.distmarker.Dist;

import net.minecraft.util.ResourceLocation;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.client.Minecraft;

import com.mojang.blaze3d.systems.RenderSystem;
import com.mojang.blaze3d.platform.GlStateManager;

@Mod.EventBusSubscriber
public class HealthTrackerOverlay {

    @OnlyIn(Dist.CLIENT)
    @SubscribeEvent(priority = EventPriority.NORMAL)
    public static void eventHandler(RenderGameOverlayEvent.Post event) {
        if (event.getType() == RenderGameOverlayEvent.ElementType.HELMET) {
            int w = event.getWindow().getScaledWidth();
            int h = event.getWindow().getScaledHeight();

            PlayerEntity entity = Minecraft.getInstance().player;
            if (entity == null)
                return;

            // Размер всей текстуры
            int textureWidth = 128;
            int textureHeight = 17;

            // Координаты: левый верхний угол
            int x = 10;
            int y = 10;

            // Текущие HP и максимум
            float currentHealth = entity.getHealth();
            float maxHealth = entity.getMaxHealth();

            // Процент здоровья (0.0 — 1.0)
            float healthPercent = currentHealth / maxHealth;
            if (healthPercent < 0.0f)
                healthPercent = 0.0f;
            if (healthPercent > 1.0f)
                healthPercent = 1.0f;

            // Ширина полоски, которую будем рисовать
            int healthBarWidth = (int) (textureWidth * healthPercent);

            // GL настройки
            RenderSystem.disableDepthTest();
            RenderSystem.depthMask(false);
            RenderSystem.blendFuncSeparate(
                    GlStateManager.SourceFactor.SRC_ALPHA,
                    GlStateManager.DestFactor.ONE_MINUS_SRC_ALPHA,
                    GlStateManager.SourceFactor.ONE,
                    GlStateManager.DestFactor.ZERO);
            RenderSystem.color4f(1.0F, 1.0F, 1.0F, 1.0F);
            RenderSystem.disableAlphaTest();

            // Рисуем текстуру
            Minecraft.getInstance().getTextureManager().bindTexture(
                    new ResourceLocation("weapon_adventure:textures/screens/healthbar100.png"));

            Minecraft.getInstance().ingameGUI.blit(
                    event.getMatrixStack(),
                    x, y,
                    0, 0,
                    healthBarWidth, textureHeight,
                    128, 17);

            // Восстановление состояния
            RenderSystem.depthMask(true);
            RenderSystem.enableDepthTest();
            RenderSystem.enableAlphaTest();
            RenderSystem.color4f(1.0F, 1.0F, 1.0F, 1.0F);

            // 🔷 Рисуем текст HP поверх полоски
            String hpText = String.format("%d / %d", Math.round(currentHealth), Math.round(maxHealth));
            int textColor = 0xFFFFFF; // белый
            Minecraft.getInstance().fontRenderer.drawStringWithShadow(
                    event.getMatrixStack(),
                    hpText,
                    x + textureWidth / 2f - Minecraft.getInstance().fontRenderer.getStringWidth(hpText) / 2f,
                    y + (textureHeight - 8) / 2f,
                    textColor);
        }
    }

    // 🔷 Отключаем стандартный HP-бар
    @OnlyIn(Dist.CLIENT)
    @SubscribeEvent(priority = EventPriority.HIGHEST)
    public static void onRenderPre(RenderGameOverlayEvent.Pre event) {
        if (event.getType() == RenderGameOverlayEvent.ElementType.HEALTH) {
            event.setCanceled(true);
        }
    }
}

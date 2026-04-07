// @ts-nocheck
//% color=#1E90FF weight=100 icon="\uf544"
//% block="AI"
namespace ai {

    /**
     * 감지 기준 위치
     */
    export const enum ScanCenter {
        //% block="에이전트"
        Agent = 0,
        //% block="플레이어"
        Player = 1
    }

    /**
     * 감지할 대상 종류
     */
    export const enum ScanTarget {
        //% block="플레이어"
        Player = 0,
        //% block="몬스터"
        Monster = 1,
        //% block="몹"
        Mob = 2,
        //% block="전체"
        All = 3
    }

    /**
     * 기본 대상 선택자
     */
    export const enum BasicTarget {
        //% block="@a 모든 플레이어"
        AllPlayers = 0,
        //% block="@r 랜덤 플레이어"
        RandomPlayer = 1,
        //% block="@s 자기 자신"
        Self = 2,
        //% block="@p 가장 가까운 플레이어"
        NearestPlayer = 3
    }

    // shadow 전용 — 블록 목록에 표시되지 않음
    //% blockId=ai_basic_target
    //% block="$t"
    //% blockHidden=true
    export function basicTarget(t: BasicTarget): TargetSelector {
        if (t == BasicTarget.RandomPlayer) return mobs.target(RANDOM_PLAYER)
        if (t == BasicTarget.Self) return mobs.target(LOCAL_PLAYER)
        if (t == BasicTarget.NearestPlayer) return mobs.target(NEAREST_PLAYER)
        return mobs.target(ALL_PLAYERS)
    }

    /**
     * 아이템 소지 위치 슬롯
     */
    export const enum ItemSlot {
        //% block="인벤토리"
        Inventory = 0,
        //% block="주 손"
        Mainhand = 1,
        //% block="보조 손"
        Offhand = 2,
        //% block="헬멧"
        Head = 3,
        //% block="흉갑"
        Chest = 4,
        //% block="레깅스"
        Legs = 5,
        //% block="부츠"
        Feet = 6
    }

    /**
     * 주변 엔티티를 감지하여 TargetSelector를 반환합니다.
     */
    //% blockId=ai_scan_near
    //% block="$scanCenter 주변 반경 $radius 칸에서 $scanTarget 최대 $count 개 감지"
    //% radius.defl=3 radius.min=1 radius.max=10
    //% count.defl=1 count.min=1 count.max=10
    //% weight=200
    export function scanNear(scanCenter: ScanCenter, scanTarget: ScanTarget, radius: number, count: number): TargetSelector {
        let pos = scanCenter == ScanCenter.Player ? player.position() : agent.getPosition()
        let sel = mobs.near(mobs.target(ALL_ENTITIES), pos, radius)
        if (scanTarget == ScanTarget.Player) {
            sel = mobs.near(mobs.target(ALL_PLAYERS), pos, radius)
        } else if (scanTarget == ScanTarget.Monster) {
            sel.addRule("family", "monster")
        } else if (scanTarget == ScanTarget.Mob) {
            sel.addRule("family", "mob")
        }
        sel.addRule("c", "" + count)
        return sel
    }

    /**
     * 대상이 특정 슬롯에 이름이 붙은 아이템을 소지하고 있는지 확인합니다.
     * 이름은 네임태그 또는 모루에서 지정한 커스텀 이름입니다.
     */
    //% blockId=ai_entity_has_named_item
    //% block="$target 이(가) $slot 에 이름이 $itemName 인 아이템 소지"
    //% target.shadow=ai_basic_target
    //% weight=195
    export function entityHasNamedItem(target: TargetSelector, slot: ItemSlot, itemName: string): boolean {
        let slotName = "slot.inventory"
        if (slot == ItemSlot.Mainhand) slotName = "slot.weapon.mainhand"
        else if (slot == ItemSlot.Offhand) slotName = "slot.weapon.offhand"
        else if (slot == ItemSlot.Head) slotName = "slot.armor.head"
        else if (slot == ItemSlot.Chest) slotName = "slot.armor.chest"
        else if (slot == ItemSlot.Legs) slotName = "slot.armor.legs"
        else if (slot == ItemSlot.Feet) slotName = "slot.armor.feet"
        target.addRule("hasitem", "{name=" + itemName + ",location=" + slotName + "}")
        player.execute("setblock 1000 5 1000 air 0 destroy")
        player.execute("execute " + target + " ~~~ setblock 1000 5 1000 stone")
        return blocks.testForBlock(Block.Stone, world(1000, 5, 1000))
    }

    /**
     * 대상이 특정 슬롯에 특정 아이템을 소지하고 있는지 확인합니다.
     */
    //% blockId=ai_entity_has_item
    //% block="$target 이(가) $slot 에 $item 소지"
    //% target.shadow=ai_basic_target
    //% item.shadow=minecraftItem
    //% item.defl=GRASS
    //% weight=190
    export function entityHasItem(target: TargetSelector, slot: ItemSlot, item: number): boolean {
        let slotName = "slot.inventory"
        if (slot == ItemSlot.Mainhand) slotName = "slot.weapon.mainhand"
        else if (slot == ItemSlot.Offhand) slotName = "slot.weapon.offhand"
        else if (slot == ItemSlot.Head) slotName = "slot.armor.head"
        else if (slot == ItemSlot.Chest) slotName = "slot.armor.chest"
        else if (slot == ItemSlot.Legs) slotName = "slot.armor.legs"
        else if (slot == ItemSlot.Feet) slotName = "slot.armor.feet"
        target.addRule("hasitem", "{item=" + blocks.nameOfBlock(item) + ",location=" + slotName + "}")
        player.execute("setblock 1000 5 1000 air 0 destroy")
        player.execute("execute " + target + " ~~~ setblock 1000 5 1000 stone")
        return blocks.testForBlock(Block.Stone, world(1000, 5, 1000))
    }

}

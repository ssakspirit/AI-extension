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
        //% block="핫바"
        Hotbar = 1,
        //% block="주 손"
        Mainhand = 2,
        //% block="보조 손"
        Offhand = 3,
        //% block="헬멧"
        Head = 4,
        //% block="흉갑"
        Chest = 5,
        //% block="레깅스"
        Legs = 6,
        //% block="부츠"
        Feet = 7
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

    function toSlotName(slot: ItemSlot): string {
        if (slot == ItemSlot.Hotbar) return "slot.hotbar"
        if (slot == ItemSlot.Mainhand) return "slot.weapon.mainhand"
        if (slot == ItemSlot.Offhand) return "slot.weapon.offhand"
        if (slot == ItemSlot.Head) return "slot.armor.head"
        if (slot == ItemSlot.Chest) return "slot.armor.chest"
        if (slot == ItemSlot.Legs) return "slot.armor.legs"
        if (slot == ItemSlot.Feet) return "slot.armor.feet"
        return "slot.inventory"
    }

    /**
     * 대상이 특정 슬롯에 특정 아이템을 소지하고 있는지 확인합니다. (아이템 피커)
     */
    //% blockId=ai_entity_has_item_picker
    //% block="$target 이(가) $slot 에 $item 소지"
    //% target.shadow=ai_basic_target
    //% item.shadow=minecraftItem
    //% item.defl=GRASS
    //% weight=195
    export function entityHasItemPicker(target: TargetSelector, slot: ItemSlot, item: number): TargetSelector {
        let itemId = blocks.nameOfBlock(item).toLowerCase().split(" ").join("_")
        target.addRule("hasitem", "{item=" + itemId + ",location=" + toSlotName(slot) + "}")
        return target
    }

    /**
     * 대상이 특정 슬롯에 특정 아이템을 소지하고 있는지 확인합니다. (아이템 ID 직접 입력)
     */
    //% blockId=ai_entity_has_item
    //% block="$target 이(가) $slot 에 $itemId 소지"
    //% target.shadow=ai_basic_target
    //% slot.defl=ItemSlot.Hotbar
    //% itemId.defl="grass_block"
    //% weight=190
    export function entityHasItem(target: TargetSelector, slot: ItemSlot, itemId: string): TargetSelector {
        target.addRule("hasitem", "{item=" + itemId + ",location=" + toSlotName(slot) + "}")
        return target
    }

    /**
     * 에이전트 인벤토리를 아이템 종류별로 정렬합니다.
     */
    //% blockId=ai_sort_agent_inventory
    //% block="에이전트 인벤토리 정렬"
    //% weight=180
    export function sortAgentInventory(): void {
        let items: number[] = []
        let counts: number[] = []

        // 1단계: 슬롯 1~28 읽기 (빈 슬롯 제외)
        for (let i = 1; i <= 28; i++) {
            let detail = agent.getItemDetail(i)
            let count = agent.getItemCount(i)
            if (detail != 0 && count > 0) {
                items.push(detail)
                counts.push(count)
            }
        }

        // 2단계: 같은 아이템 총합 계산
        let sumItems: number[] = []
        let sumCounts: number[] = []
        for (let i = 0; i < items.length; i++) {
            let found = -1
            for (let j = 0; j < sumItems.length; j++) {
                if (sumItems[j] == items[i]) {
                    found = j
                    break
                }
            }
            if (found >= 0) {
                sumCounts[found] += counts[i]
            } else {
                sumItems.push(items[i])
                sumCounts.push(counts[i])
            }
        }

        // 3단계: 총합을 64개씩 슬롯으로 분리
        let mergedItems: number[] = []
        let mergedCounts: number[] = []
        for (let i = 0; i < sumItems.length; i++) {
            let remaining = sumCounts[i]
            while (remaining > 0) {
                let stack = remaining > 64 ? 64 : remaining
                mergedItems.push(sumItems[i])
                mergedCounts.push(stack)
                remaining -= stack
            }
        }

        // 4단계: 아이템 ID 기준 버블 정렬
        for (let i = 0; i < mergedItems.length - 1; i++) {
            for (let j = 0; j < mergedItems.length - 1 - i; j++) {
                if (mergedItems[j] > mergedItems[j + 1]) {
                    let tmpItem = mergedItems[j]
                    mergedItems[j] = mergedItems[j + 1]
                    mergedItems[j + 1] = tmpItem
                    let tmpCount = mergedCounts[j]
                    mergedCounts[j] = mergedCounts[j + 1]
                    mergedCounts[j + 1] = tmpCount
                }
            }
        }

        // 5단계: 전체 슬롯 비우기 (1~28)
        for (let i = 1; i <= 28; i++) {
            agent.setItem(AIR, 1, i)
        }

        // 6단계: 정렬된 순서대로 다시 쓰기 (1부터)
        for (let i = 0; i < mergedItems.length; i++) {
            agent.setItem(mergedItems[i], mergedCounts[i], i + 1)
        }
    }

}

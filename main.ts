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
     * 에이전트 이동/파괴 방향 (한국어)
     */
    export const enum AgentDirection {
        //% block="앞"
        Forward = 0,
        //% block="뒤"
        Back = 1,
        //% block="왼"
        Left = 2,
        //% block="오른"
        Right = 3,
        //% block="위"
        Up = 4,
        //% block="아래"
        Down = 5
    }

    function toSixDirection(dir: AgentDirection): SixDirection {
        if (dir == AgentDirection.Back) return SixDirection.Back
        if (dir == AgentDirection.Left) return SixDirection.Left
        if (dir == AgentDirection.Right) return SixDirection.Right
        if (dir == AgentDirection.Up) return SixDirection.Up
        if (dir == AgentDirection.Down) return SixDirection.Down
        return SixDirection.Forward
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
     * 에이전트가 특정 아이템을 지정 방향으로 모두 내려놓습니다.
     */
    //% blockId=ai_agent_drop_item
    //% block="에이전트가 $direction 방향으로 $item 내려놓기"
    //% item.shadow=minecraftItem
    //% item.defl=GRASS
    //% weight=185
    export function agentDropItem(direction: AgentDirection, item: number): void {
        let sixDir = toSixDirection(direction)
        for (let i = 28; i >= 1; i--) {
            if (agent.getItemDetail(i) == item) {
                let count = agent.getItemCount(i)
                agent.drop(sixDir, i, count)
            }
        }
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

    // 블록 데이터 분석 전역 상태
    let _totalBroken = 0
    let _trackedBlocks: number[] = []
    let _blockCounts: number[] = []

    /**
     * 블록 분석 데이터를 초기화합니다.
     */
    //% blockId=ai_reset_analysis
    //% block="블록 분석 초기화"
    //% weight=176
    export function resetAnalysis(): void {
        _totalBroken = 0
        _trackedBlocks = []
        _blockCounts = []
    }

    function getPosInDirection(direction: AgentDirection): Position {
        let pos = agent.getPosition()
        let orient = agent.getOrientation()
        let dx = 0, dy = 0, dz = 0

        if (direction == AgentDirection.Up) {
            dy = 1
        } else if (direction == AgentDirection.Down) {
            dy = -1
        } else {
            let fx = 0, fz = 0
            if (orient == 0) { fz = 1 }
            else if (orient == 180 || orient == -180) { fz = -1 }
            else if (orient == -90) { fx = 1 }
            else { fx = -1 } // 90

            if (direction == AgentDirection.Forward) {
                dx = fx; dz = fz
            } else if (direction == AgentDirection.Back) {
                dx = -fx; dz = -fz
            } else if (direction == AgentDirection.Left) {
                dx = -fz; dz = fx
            } else { // Right
                dx = fz; dz = -fx
            }
        }

        return positions.create(pos.x + dx, pos.y + dy, pos.z + dz)
    }

    /**
     * 에이전트가 지정 방향으로 N번 블록을 부수며 블록 종류를 분석합니다.
     */
    //% blockId=ai_analyze_blocks
    //% block="에이전트 $direction 방향 블록 분석 $block1||대상 블록 2: $block2"
    //% block1.shadow=minecraftBlock block1.defl=GRASS
    //% block2.shadow=minecraftBlock block2.defl=STONE
    //% expandableArgumentMode="enabled"
    //% weight=175
    export function analyzeBlocks(direction: AgentDirection, block1: number, block2: number = 0): void {
        if (block1 != 0 && _trackedBlocks.indexOf(block1) < 0) {
            _trackedBlocks.push(block1); _blockCounts.push(0)
        }
        if (block2 != 0 && _trackedBlocks.indexOf(block2) < 0) {
            _trackedBlocks.push(block2); _blockCounts.push(0)
        }

        let blockPos = getPosInDirection(direction)
        for (let j = 0; j < _trackedBlocks.length; j++) {
            if (blocks.testForBlock(_trackedBlocks[j], blockPos)) {
                _blockCounts[j]++
                break
            }
        }
        _totalBroken++
        agent.destroy(toSixDirection(direction))
    }

    /**
     * 마지막 분석에서 특정 블록의 비율(0~1)을 반환합니다.
     */
    //% blockId=ai_get_analysis_result
    //% block="$block 분석 결과"
    //% block.shadow=minecraftBlock block.defl=GRASS
    //% weight=170
    export function getAnalysisResult(block: number): number {
        if (_totalBroken == 0) return 0
        for (let i = 0; i < _trackedBlocks.length; i++) {
            if (_trackedBlocks[i] == block) {
                return _blockCounts[i] / _totalBroken
            }
        }
        return 0
    }

}

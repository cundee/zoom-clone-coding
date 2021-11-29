# 경계선을 확인하는 함수
def boundary(x, y):
    if x < 19 and x >= 0 and y < 19 and y >= 0:
        return True
    return False
 
arr = [list(map(int, input().split())) for _ in range(19)]
# 하, 우, 우하, 우상
dx = [0, 1, 1, 1]
dy = [1, 0, 1, -1]
 
# 오목이 완성되었는지 확인하는 함수
def om():
    # 전체 배열을 순회 (0,0부터 열방향으로 움직임)
    for j in range(19):
        for i in range(19):
            # 4방향 검사
            if arr[j][i]:
                for d in range(4):
                    move_x = i
                    move_y = j
                    cnt = 1
                    # 같은 돌이 놓여있고 경계선 내부일 경우 진행
                    while boundary(move_x + dx[d], move_y + dy[d]) and (arr[j][i] == arr[move_y + dy[d]][move_x + dx[d]]):
                        move_x += dx[d]
                        move_y += dy[d]
                        cnt += 1
                    # 돌의 개수가 5개일 때 반대 방향 검사
                    if cnt == 5:
                        move_x = i
                        move_y = j
                        # 반대방향에 같은 돌이 있는 경우 현재 반복 종료
                        if boundary(move_x - dx[d], move_y - dy[d]) and (arr[j][i] == arr[move_y - dy[d]][move_x - dx[d]]):
                            break
                        # 오목이 완성된 경우 결과 반환
                        else:
                            return arr[j][i], i+1, j+1
    # 오목이 완성 안된경우 결과 반환
    return 0, -1, -1
 
c, x, y = om()
if c == 0:
    print(0)
else:
    print(c)
    print(y, x)

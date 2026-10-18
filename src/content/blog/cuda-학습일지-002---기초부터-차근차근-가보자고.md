---
title: cuda 학습일지 002 - 기초부터 차근차근 가보자고
description: CUDA란?
date: '2025-01-14T14:49:53.202Z'
tags:
  - cuda
  - 학습일지
series:
  id: d88dfc95-d5c0-471e-8478-f4470ee73972
  name: 학습일지 -cuda-
thumbnail: >-
  /programmiy.log/images/uploads/velog/92584f23-20f9-43ff-88b9-7a290dc9b47b-image.png
draft: false
---
CUDA란? Compute Unified Device Architecture

NVIDIA가 만든 GPGPU 플랫폼 및 API 모델


GPGPU는 
General-Purpose computing on Graphics Processing Units
즉, GPU를 통해 CPU와 같은 범용 연산을 수행하는 기술

![](/programmiy.log/images/uploads/velog/92584f23-20f9-43ff-88b9-7a290dc9b47b-image.png)

이건 내 그래픽 카드인 RTX 2070 S이다
갑자기 이걸 보여주는 이유는 GPGPU는 CPU대비 GPU의 초당 최대 처리량 (FLoating point Operations Per Second, FLOPS)이 우수한걸 응용한 것이기 때문이다.
![](/programmiy.log/images/uploads/velog/f9ceff05-8b39-4ca3-915b-761f7518dec5-image.png)
같은 예시로 이건 내 cpu인 ryzen 5 3600xt인데, gpu의 성능이 fp 32 기준 9.06 테라 플롭스인데  cpu는 1296 기가 플롭스가 전부이다.

테라플롭스가	10^12이고
기가플롭스가	10^9인 것을 보면, 압도적인 성능 차이가 존재한다고 볼 수 있다.


flops를 이해하기 위해서는 잠시 컴퓨터의 기초 원리부터 살펴 볼 수 있는데 
여기부터는 2025/01/14에 작성

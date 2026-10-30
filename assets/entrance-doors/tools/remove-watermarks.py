"""
Удаление знаков партнёра с нижней части кадра входной двери (нейросеть LaMa).

Знаки: полупрозрачный логотип «LABIRINT DOORS» (слева на внешней двери, справа
на внутренней) и серые плашки «Магнитный уплотнитель» и т. п. (слева).
Маска — два прямоугольника на месте логотипа + плашка, найденная по цвету.
LaMa достраивает фон; из результата берутся только строки от 852.

Нужно: python3 (opencv-contrib-python-headless, numpy, onnxruntime) и модель
https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx (208 МБ,
в репозиторий не кладём). Исходники кадров (1000×977) — у партнёра, в репозитории
их нет.

  python3 remove-watermarks.py lama_fp32.onnx оригинал.jpg готовое.png

Результат склеивают с готовым кадром из assets/entrance-doors/ (верх, 836 строк, оттуда;
строки 836–851 — плавный переход, ниже — результат LaMa). Проверять глазами: на
рёбристых внутренних панелях с овальным стеклом (Алюска, Кредор, Эволаб, Кармина…)
LaMa рисует стекло шире настоящего — такие коллекции в обработку не брали.
"""
import sys
import cv2
import numpy as np
import onnxruntime as ort


def pill_box(im):
    b, g, r = [im[:, :, i].astype(int) for i in range(3)]
    grey = (abs(r - g) < 7) & (abs(g - b) < 7) & (g >= 92) & (g <= 122)
    grey[:855] = False
    grey[:, 520:] = False
    m = cv2.morphologyEx(grey.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, _, st, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    best = None
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if a > 2500 and 150 < w < 400 and 35 < h < 90 and (best is None or a > best[4]):
            best = (int(x), int(y), int(w), int(h), int(a))
    return best


def mask_for(im):
    m = np.zeros(im.shape[:2], np.uint8)
    cv2.rectangle(m, (95, 852), (418, 966), 255, -1)   # логотип слева (и плашка рядом)
    cv2.rectangle(m, (625, 855), (915, 960), 255, -1)  # логотип справа
    return m


def run(session, bgr, mask):
    out = bgr.copy()
    for x0 in (0, 488):  # два окна 512×512: слева и справа
        y0 = bgr.shape[0] - 512
        sub = cv2.cvtColor(bgr[y0:, x0:x0 + 512], cv2.COLOR_BGR2RGB)
        ms = mask[y0:, x0:x0 + 512]
        x = (sub.astype(np.float32) / 255.0)[None].transpose(0, 3, 1, 2)
        o = session.run(None, {session.get_inputs()[0].name: x,
                               session.get_inputs()[1].name: (ms > 0).astype(np.float32)[None, None]})[0][0]
        o = np.clip(o.transpose(1, 2, 0), 0, 255).astype(np.uint8)
        sel = np.zeros_like(mask)
        sel[y0:, x0:x0 + 512] = ms
        sel[:, :(0 if x0 == 0 else 500)] = 0
        sel[:, (500 if x0 == 0 else 1000):] = 0
        s = sel[y0:, x0:x0 + 512] > 0
        out[y0:, x0:x0 + 512][s] = cv2.cvtColor(o, cv2.COLOR_RGB2BGR)[s]
    return out


if __name__ == '__main__':
    model, src, dst = sys.argv[1:4]
    im = cv2.resize(cv2.imread(src), (1000, 977), interpolation=cv2.INTER_AREA)
    cv2.imwrite(dst, run(ort.InferenceSession(model, providers=['CPUExecutionProvider']), im, mask_for(im)))

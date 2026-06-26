#!/usr/bin/env python3
"""
OPEX Design Agent — Playwright Export Script
Exports HTML designs to PNG at exact pixel dimensions.

Usage:
    python export.py --input slide.html --output slide.png --width 1080 --height 1350

Requirements:
    pip install playwright
    playwright install chromium
"""

import argparse
import asyncio
from pathlib import Path


async def export_to_png(
    input_path: str,
    output_path: str,
    width: int = 1080,
    height: int = 1350,
    wait_ms: int = 3000,
):
    """Export an HTML file to PNG using Playwright."""
    from playwright.async_api import async_playwright

    # Calculate viewport and device scale factor
    viewport_width = 420
    viewport_height = int(viewport_width * (height / width))
    device_scale_factor = width / viewport_width

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(
            viewport={"width": viewport_width, "height": viewport_height},
            device_scale_factor=device_scale_factor,
        )

        # Load the HTML file
        input_file = Path(input_path).resolve()
        await page.goto(f"file://{input_file}")

        # Wait for fonts to load
        await page.wait_for_timeout(wait_ms)

        # Take screenshot
        await page.screenshot(path=output_path, type="png")

        await browser.close()

    print(f"Exported: {output_path}")
    print(f"  Dimensions: {width}x{height}")
    print(f"  Viewport: {viewport_width}x{viewport_height}")
    print(f"  Scale factor: {device_scale_factor:.4f}")


def main():
    parser = argparse.ArgumentParser(description="Export HTML to PNG")
    parser.add_argument("--input", "-i", required=True, help="Input HTML file")
    parser.add_argument("--output", "-o", required=True, help="Output PNG file")
    parser.add_argument("--width", "-W", type=int, default=1080, help="Output width")
    parser.add_argument("--height", "-H", type=int, default=1350, help="Output height")
    parser.add_argument("--wait", "-w", type=int, default=3000, help="Wait time (ms)")
    args = parser.parse_args()

    asyncio.run(export_to_png(args.input, args.output, args.width, args.height, args.wait))


if __name__ == "__main__":
    main()

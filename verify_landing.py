from playwright.sync_api import sync_playwright

def verify_landing():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to localhost...")
            # Go to localhost
            page.goto("http://localhost:3000", timeout=60000)

            print("Waiting for body...")
            page.wait_for_selector("body", timeout=60000)

            print("Taking debug screenshot...")
            page.screenshot(path="debug_landing.png", full_page=True)

            print("Waiting for NeuroStrat text...")
            # Wait for content to load (the Hero title)
            page.wait_for_selector("text=NeuroStrat", timeout=30000)

            # Take a full page screenshot
            page.screenshot(path="landing_verification.png", full_page=True)
            print("Screenshot saved to landing_verification.png")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error_landing.png", full_page=True)
        finally:
            browser.close()

if __name__ == "__main__":
    verify_landing()

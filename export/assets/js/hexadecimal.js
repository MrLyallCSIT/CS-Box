// Ensure the script only runs if the URL path contains "hexadecimal"
if (window.location.pathname.includes("hexadecimal")) {
  const isGCSE = window.location.pathname.includes("gcse-hexadecimal");
  const hexLength = isGCSE ? 2 : 4;       // GCSE: 2 hex digits, A Level: 4
  const binaryLength = isGCSE ? 8 : 16;   // GCSE: 8 bits, A Level: 16
  const maxDenary = isGCSE ? 255 : 65535;

  // Each slider represents a 4-bit nibble (0–15) at a given place value
  const placeValues = { 1: 0, 16: 0, 256: 0, 4096: 0 };
  const sliders = {};

  // Order matters: left->right nibble columns
  const columnValues = isGCSE ? [16, 1] : [4096, 256, 16, 1];

  // Attach event listeners for sliders
  ["slider1", "slider16", "slider256", "slider4096"].forEach((sliderId) => {
    const slider = document.getElementById(sliderId);
    if (slider) {
      sliders[sliderId] = slider;
      slider.addEventListener("input", (e) => {
        e.stopPropagation(); // Prevent event propagation to Bootstrap
        updatePlace(parseInt(sliderId.replace("slider", ""), 10));
      });
    }
  });

  function updatePlace(place) {
    const slider = sliders[`slider${place}`];
    if (!slider) return;
    placeValues[place] = parseInt(slider.value, 10) || 0;
    updateNumbers();
  }

  function updateNumbers() {
    let denary = 0;
    let binary = "";
    let hexadecimal = "";

    columnValues.forEach((column) => {
      const value = placeValues[column] ?? 0; // nibble 0..15
      denary += value * column;
      binary += convertToBinaryNibble(value);
      hexadecimal += convertToHexDigit(value);
    });

    // Ensure fixed lengths
    binary = binary.slice(-binaryLength).padStart(binaryLength, "0");
    hexadecimal = hexadecimal.slice(-hexLength).padStart(hexLength, "0");

    const binEl = document.getElementById("binaryNumber");
    const denEl = document.getElementById("denaryNumber");
    const hexEl = document.getElementById("hexadecimalNumber");

    if (binEl) binEl.innerText = binary;
    if (denEl) denEl.innerText = denary;
    if (hexEl) hexEl.innerText = hexadecimal;
  }

  function convertToBinaryNibble(num) {
    return num.toString(2).padStart(4, "0");
  }

  function convertToHexDigit(num) {
    return num.toString(16).toUpperCase(); // 0..F
  }

  function setSlidersFromDenary(denary) {
    // Clamp & normalise
    denary = Number.isFinite(denary) ? denary : 0;
    denary = Math.max(0, Math.min(maxDenary, Math.floor(denary)));

    // Convert denary into nibble values for each column
    columnValues.forEach((column) => {
      const nibble = Math.floor(denary / column);
      placeValues[column] = Math.max(0, Math.min(15, nibble));
      denary -= placeValues[column] * column;
    });

    // Push values to sliders (if present)
    columnValues.forEach((column) => {
      const slider = sliders[`slider${column}`];
      if (slider) slider.value = placeValues[column];
    });

    updateNumbers();
  }

  function cleanHexInput(input) {
    return String(input)
      .trim()
      .replace(/^0x/i, "")
      .toUpperCase();
  }

  function cleanBinaryInput(input) {
    return String(input).trim().replace(/\s+/g, "");
  }

  // === PUBLIC BUTTON HANDLERS ===
  // Call these from onclick="" on your buttons

  window.requestHexadecimal = function requestHexadecimal() {
    const raw = prompt(
      `Enter a ${hexLength}-digit hexadecimal value (0-9, A-F):`,
      ""
    );
    if (raw === null) return;

    const hex = cleanHexInput(raw);

    const re = new RegExp(`^[0-9A-F]{${hexLength}}$`);
    if (!re.test(hex)) {
      alert(`Please enter exactly ${hexLength} hex digit(s) using 0-9 and A-F.`);
      return;
    }

    const denary = parseInt(hex, 16);
    setSlidersFromDenary(denary);
  };

  window.requestDenaryForHexadecimal =
    function requestDenaryForHexadecimal() {
      const raw = prompt(`Enter a denary value (0 to ${maxDenary}):`, "");
      if (raw === null) return;

      // Allow digits only
      const cleaned = String(raw).trim();
      if (!/^\d+$/.test(cleaned)) {
        alert("Please enter a whole number in denary (digits only).");
        return;
      }

      const denary = parseInt(cleaned, 10);
      if (denary < 0 || denary > maxDenary) {
        alert(`Please enter a number between 0 and ${maxDenary}.`);
        return;
      }

      setSlidersFromDenary(denary);
    };

  window.requestBinaryforHexadecimal = function requestBinaryforHexadecimal() {
    const raw = prompt(`Enter a ${binaryLength}-bit binary value (0s and 1s):`, "");
    if (raw === null) return;

    const bin = cleanBinaryInput(raw);

    const re = new RegExp(`^[01]{${binaryLength}}$`);
    if (!re.test(bin)) {
      alert(`Please enter exactly ${binaryLength} bits using only 0 and 1.`);
      return;
    }

    const denary = parseInt(bin, 2);
    setSlidersFromDenary(denary);
  };

  document.addEventListener("DOMContentLoaded", () => {
    updateNumbers();
  });
}

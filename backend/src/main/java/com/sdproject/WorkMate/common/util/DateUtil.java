package com.sdproject.WorkMate.common.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class DateUtil {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private DateUtil() {
        // Private constructor to prevent instantiation
    }

    public static String formatDate(LocalDate date) {
        return date == null ? null : date.format(FORMATTER);
    }

    public static LocalDate parseDate(String dateStr) {
        return dateStr == null ? null : LocalDate.parse(dateStr, FORMATTER);
    }
}

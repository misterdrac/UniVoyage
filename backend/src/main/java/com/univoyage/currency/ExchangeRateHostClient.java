package com.univoyage.currency;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class ExchangeRateHostClient {

    private final RestClient restClient = RestClient.builder().build();

    public double getRate(String base, String target) {
        String url = "https://api.exchangerate.host/convert?from={base}&to={target}";

        Response response = restClient.get()
                .uri(url, base, target)
                .retrieve()
                .body(Response.class);

        if (response == null || !response.isSuccess() || response.getResult() == null) {
            throw new IllegalStateException("Fallback API failed");
        }

        return response.getResult();
    }

    public static class Response {
        private boolean success;
        private double result;

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public double getResult() { return result; }
        public void setResult(double result) { this.result = result; }
    }
}
package com.univoyage.currency;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class ExchangeRateHostClient {

    private final RestClient restClient = RestClient.builder().build();

    @Value("${app.currency.fallback.key}")
    private String apiKey;

    @Value("${app.currency.fallback.base-url:https://api.exchangerate.host}")
    private String baseUrl;

    public double getRate(String base, String target) {
        String url = baseUrl + "/convert?access_key={key}&from={base}&to={target}&amount=1";

        Response response = restClient.get()
                .uri(url, apiKey, base, target)
                .retrieve()
                .body(Response.class);

        if (response == null || Boolean.FALSE.equals(response.getSuccess()) || response.getResult() == null) {
            throw new IllegalStateException("Fallback API failed");
        }

        return response.getResult();
    }

    public static class Response {
        private Boolean success;
        private Double result;

        private Info info;

        public Boolean getSuccess() { return success; }
        public void setSuccess(Boolean success) { this.success = success; }

        public Double getResult() { return result; }
        public void setResult(Double result) { this.result = result; }

        public Info getInfo() { return info; }
        public void setInfo(Info info) { this.info = info; }
    }

    public static class Info {
        @JsonProperty("quote")
        private Double quote;

        public Double getQuote() { return quote; }
        public void setQuote(Double quote) { this.quote = quote; }
    }
}